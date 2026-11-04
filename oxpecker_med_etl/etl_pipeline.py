"""
Production-Grade Medicine ETL Pipeline for Oxpecker AI (`oxpecker_med_db`).
Executes zero-hallucination extraction, canonical normalization, SHA-256 deduplication,
cross-dataset clinical enrichment, and chunked MySQL 8.0 bulk upserts.
"""
from __future__ import annotations

import csv
import json
import sys
import time
from collections import defaultdict
from dataclasses import dataclass, field
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.dialects.mysql import insert as mysql_insert

from oxpecker_med_etl.config import (
    BATCH_CHUNK_SIZE,
    DATA_PROCESSED_DIR,
    DATA_RAW_DIR,
    MYSQL_DB,
    ensure_local_mysql_running,
    get_database_url,
    get_mysql_server_url,
)
from oxpecker_med_etl.models import Base, DrugClass, Generic, Manufacturer, Medicine
from oxpecker_med_etl.normalizer import (
    compute_composite_key,
    compute_dedup_hash,
    extract_bdt_prices,
    extract_pregnancy_category,
    make_slug,
    normalize_base_generic_key,
    normalize_dosage_form_icon,
    normalize_generic_key,
    normalize_lookup_generic_key,
    sanitize_text,
)

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


@dataclass
class AuditStats:
    raw_rows_read: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    exact_duplicates_dropped: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    malformed_rows_rejected: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    clean_rows_upserted: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    enrichment_hits: Dict[str, int] = field(default_factory=lambda: defaultdict(int))


def ensure_database_and_schema() -> Any:
    """Create `oxpecker_med_db` with utf8mb4_unicode_ci and initialize all InnoDB tables."""
    ensure_local_mysql_running()
    server_engine = create_engine(get_mysql_server_url(), pool_pre_ping=True)
    with server_engine.begin() as conn:
        conn.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )
    server_engine.dispose()

    db_engine = create_engine(
        get_database_url(),
        pool_pre_ping=True,
        pool_recycle=3600,
    )
    # Drop and recreate tables cleanly for deterministic idempotent ETL runs
    with db_engine.begin() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        for tbl in ("medicines", "generics", "drug_classes", "manufacturers"):
            conn.execute(text(f"DROP TABLE IF EXISTS `{tbl}`"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

    Base.metadata.create_all(db_engine)
    return db_engine


def bulk_upsert_mysql(engine: Any, model_cls: Any, rows: List[Dict[str, Any]], update_cols: List[str]) -> int:
    """Chunked SQLAlchemy MySQL INSERT ... ON DUPLICATE KEY UPDATE."""
    if not rows:
        return 0
    total = 0
    table = model_cls.__table__
    with engine.begin() as conn:
        for i in range(0, len(rows), BATCH_CHUNK_SIZE):
            chunk = rows[i : i + BATCH_CHUNK_SIZE]
            stmt = mysql_insert(table).values(chunk)
            update_dict = {col: stmt.inserted[col] for col in update_cols}
            stmt = stmt.on_duplicate_key_update(**update_dict)
            conn.execute(stmt)
            total += len(chunk)
    return total


def build_global_clinical_enrichment(stats: AuditStats) -> Tuple[
    Dict[str, Dict[str, Any]],
    Dict[Tuple[str, str], str],
]:
    """
    Pre-deduplicate all international datasets (INT-1, INT-2, INT-3, INT-4, INT-5)
    by canonical/lookup generic key BEFORE joining to prevent Cartesian explosion (Rule 1.3).
    Returns:
      - generic_enrichment_map: lookup_key -> {drugbank_id, description, pregnancy_category,
            rx_otc_status, alcohol_interaction, habit_forming, side_effects: list, clinical_uses: list}
      - image_lookup_map: (lookup_key, dosage_form_icon) -> reference_image_url
    """
    enrichment: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {
            "drugbank_id": None,
            "drugbank_description": None,
            "pregnancy_category": None,
            "rx_otc_status": None,
            "alcohol_interaction": None,
            "habit_forming": False,
            "side_effects": set(),
            "clinical_uses": set(),
        }
    )

    # 1. INT-4 DrugBank (7,759 molecules)
    drugbank_tsv = DATA_RAW_DIR / "int_4_drugbank" / "data" / "drugbank.tsv"
    if drugbank_tsv.exists():
        df_db = pd.read_csv(drugbank_tsv, sep="\t", dtype=str, encoding="utf-8", on_bad_lines="skip")
        stats.raw_rows_read["INT-4_DrugBank"] = len(df_db)
        for _, row in df_db.iterrows():
            db_id = sanitize_text(row.get("drugbank_id"))
            name = sanitize_text(row.get("name"))
            desc = sanitize_text(row.get("description"))
            if not db_id or not name:
                stats.malformed_rows_rejected["INT-4_DrugBank"] += 1
                continue
            for key in {normalize_generic_key(name), normalize_lookup_generic_key(name)}:
                if not key:
                    continue
                rec = enrichment[key]
                if not rec["drugbank_id"]:
                    rec["drugbank_id"] = db_id[:50]
                if desc and not rec["drugbank_description"]:
                    rec["drugbank_description"] = desc

    # 2. INT-3 Drugs.com Verified (2,931 records)
    drugs_com_csv = DATA_RAW_DIR / "int_3_drugs_com" / "drugs_side_effects_drugs_com.csv"
    if drugs_com_csv.exists():
        df_dc = pd.read_csv(drugs_com_csv, dtype=str, encoding="utf-8", on_bad_lines="skip")
        stats.raw_rows_read["INT-3_DrugsCom"] = len(df_dc)
        for _, row in df_dc.iterrows():
            gname = sanitize_text(row.get("generic_name"))
            if not gname:
                stats.malformed_rows_rejected["INT-3_DrugsCom"] += 1
                continue
            med_cond = sanitize_text(row.get("medical_condition"))
            side_eff = sanitize_text(row.get("side_effects"))
            preg_cat = extract_pregnancy_category(row.get("pregnancy_category"))
            rx_otc = sanitize_text(row.get("rx_otc"))
            alcohol = sanitize_text(row.get("alcohol"))

            for key in {normalize_generic_key(gname), normalize_lookup_generic_key(gname)}:
                if not key:
                    continue
                rec = enrichment[key]
                if preg_cat and not rec["pregnancy_category"]:
                    rec["pregnancy_category"] = preg_cat
                if rx_otc and not rec["rx_otc_status"]:
                    rec["rx_otc_status"] = rx_otc[:50]
                if alcohol and not rec["alcohol_interaction"]:
                    rec["alcohol_interaction"] = (
                        "Contraindicated / Avoid Alcohol (X)" if alcohol.upper() == "X" else alcohol[:100]
                    )
                if med_cond and len(rec["clinical_uses"]) < 25:
                    rec["clinical_uses"].add(med_cond[:180])
                if side_eff:
                    for item in side_eff.split(";"):
                        clean_se = sanitize_text(item)
                        if clean_se and 2 < len(clean_se) <= 120 and len(rec["side_effects"]) < 40:
                            rec["side_effects"].add(clean_se)

    # 3. INT-2 A-Z Medicine Dataset (253,973 records) -> brand name to salt composition bridge
    brand_to_comp_key: Dict[str, str] = {}
    raw_comp_to_lkey: Dict[str, str] = {}
    az_csv = DATA_RAW_DIR / "int_2_az_india" / "A_Z_medicines_dataset_of_India.csv"
    if az_csv.exists():
        with open(az_csv, "r", encoding="utf-8", errors="replace", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                stats.raw_rows_read["INT-2_AZ_India"] += 1
                bname = (row.get("name") or "").strip()
                c1 = (row.get("short_composition1") or "").strip()
                c2 = (row.get("short_composition2") or "").strip()
                if not bname or not c1:
                    continue
                comp_str = f"{c1} + {c2}" if c2 else c1
                lkey = raw_comp_to_lkey.get(comp_str)
                if lkey is None:
                    lkey = normalize_lookup_generic_key(comp_str)
                    raw_comp_to_lkey[comp_str] = lkey
                if lkey:
                    brand_to_comp_key[bname.lower()] = lkey

    # 4. INT-1 250k Medicines Usage & Side Effects (248,218 records)
    usage_csv = DATA_RAW_DIR / "int_1_250k_usage" / "medicine_dataset.csv"
    if usage_csv.exists():
        side_cols = [f"sideEffect{i}" for i in range(42)]
        use_cols = [f"use{i}" for i in range(5)]
        with open(usage_csv, "r", encoding="utf-8", errors="replace", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                stats.raw_rows_read["INT-1_250k_Usage"] += 1
                bname = (row.get("name") or "").strip()
                if not bname:
                    stats.malformed_rows_rejected["INT-1_250k_Usage"] += 1
                    continue
                lkey = brand_to_comp_key.get(bname.lower())
                if not lkey:
                    continue
                rec = enrichment[lkey]
                habit = (row.get("Habit Forming") or "").strip().lower()
                if habit in {"yes", "true", "1"}:
                    rec["habit_forming"] = True
                if len(rec["side_effects"]) < 35:
                    for sc in side_cols:
                        raw_se = (row.get(sc) or "").strip()
                        if not raw_se:
                            break
                        val = sanitize_text(raw_se)
                        if val and 2 < len(val) <= 120:
                            rec["side_effects"].add(val)
                if len(rec["clinical_uses"]) < 20:
                    for uc in use_cols:
                        raw_uc = (row.get(uc) or "").strip()
                        if not raw_uc:
                            break
                        val = sanitize_text(raw_uc)
                        if val and 2 < len(val) <= 180:
                            rec["clinical_uses"].add(val)

    # 5. INT-5 11,000 Medicine Details with Reference Package Image URLs (11,825 records)
    image_lookup: Dict[Tuple[str, str], str] = {}
    img_csv = DATA_RAW_DIR / "int_5_images_11k" / "Medicine_Details.csv"
    if img_csv.exists():
        df_img = pd.read_csv(img_csv, dtype=str, encoding="utf-8", on_bad_lines="skip")
        stats.raw_rows_read["INT-5_Images_11k"] = len(df_img)
        for _, row in df_img.iterrows():
            mname = sanitize_text(row.get("Medicine Name"))
            comp = sanitize_text(row.get("Composition"))
            img_url = sanitize_text(row.get("Image URL"))
            if not comp or not img_url or not img_url.startswith("http"):
                stats.malformed_rows_rejected["INT-5_Images_11k"] += 1
                continue
            lkey = normalize_lookup_generic_key(comp)
            icon_key = normalize_dosage_form_icon(mname or "tablet")
            if lkey and (lkey, icon_key) not in image_lookup:
                image_lookup[(lkey, icon_key)] = img_url[:500]
            # Also enrich side effects / uses from INT-5 if missing
            if lkey:
                rec = enrichment[lkey]
                uses_str = sanitize_text(row.get("Uses"))
                if uses_str and len(rec["clinical_uses"]) < 20:
                    rec["clinical_uses"].add(uses_str[:180])

    return enrichment, image_lookup


def run_etl() -> Tuple[AuditStats, Dict[str, Any]]:
    start_ts = time.time()
    stats = AuditStats()
    print("=" * 80)
    print("OXPECKER AI - STARTING PRODUCTION MEDICINE ETL PIPELINE")
    print("=" * 80)

    engine = ensure_database_and_schema()
    print("[STEP 4.0] MySQL 8.0 schema `oxpecker_med_db` initialized (InnoDB / utf8mb4_unicode_ci).")

    # Pre-scan all BD files to collect complete sets of Manufacturers, Drug Classes, and Generics
    bd1_dir = DATA_RAW_DIR / "bd_1_assorted"
    bd2_dir = DATA_RAW_DIR / "bd_2_rajib"
    bd3_csv = DATA_RAW_DIR / "bd_3_price_20k" / "all_medicine_and_drug_price_data(20k)_Bangladesh.csv"

    # -------------------------------------------------------------------------
    # STEP 4a: Load & Deduplicate `manufacturers` and `drug_classes`
    # -------------------------------------------------------------------------
    mfg_records: Dict[str, Dict[str, Any]] = {}
    used_mfg_slugs: Set[str] = set()

    def register_mfg(raw_name: object, raw_slug: object = None, source_tag: str = "BD-1_Manufacturer"):
        name = sanitize_text(raw_name)
        if not name:
            stats.malformed_rows_rejected[source_tag] += 1
            return
        key = name.lower().strip()
        if key in mfg_records:
            stats.exact_duplicates_dropped[source_tag] += 1
            return
        base_slug = make_slug(raw_slug or name, fallback_prefix="mfg")
        slug = base_slug
        counter = 2
        while slug in used_mfg_slugs:
            slug = f"{base_slug[:240]}-{counter}"
            counter += 1
        used_mfg_slugs.add(slug)
        mfg_records[key] = {
            "name": name[:255],
            "slug": slug[:255],
            "country": "Bangladesh",
        }

    for tag, mfg_file in [("BD-1_Manufacturer", bd1_dir / "manufacturer.csv"), ("BD-2_Manufacturer", bd2_dir / "manufacturer.csv")]:
        if mfg_file.exists():
            df_m = pd.read_csv(mfg_file, dtype=str, encoding="utf-8", on_bad_lines="skip")
            stats.raw_rows_read[tag] += len(df_m)
            for _, r in df_m.iterrows():
                register_mfg(r.get("manufacturer name") or r.get("name"), r.get("slug"), tag)

    # Also ensure any manufacturer appearing in medicine.csv or BD-3 is registered (zero orphan FK guarantee)
    for med_csv_path in [bd1_dir / "medicine.csv", bd2_dir / "medicine.csv"]:
        if med_csv_path.exists():
            df_tmp = pd.read_csv(med_csv_path, usecols=["manufacturer"], dtype=str, encoding="utf-8", on_bad_lines="skip")
            for m_val in df_tmp["manufacturer"].dropna().unique():
                register_mfg(m_val, None, "BD-1_Manufacturer_Ref")
    if bd3_csv.exists():
        df_tmp3 = pd.read_csv(bd3_csv, usecols=["manufacturer_name"], dtype=str, encoding="utf-8", on_bad_lines="skip")
        for m_val in df_tmp3["manufacturer_name"].dropna().unique():
            register_mfg(m_val, None, "BD-3_Manufacturer_Ref")

    mfg_list = list(mfg_records.values())
    stats.clean_rows_upserted["manufacturers"] = bulk_upsert_mysql(
        engine, Manufacturer, mfg_list, ["name", "country"]
    )
    print(f"[STEP 4a.1] Upserted {len(mfg_list):,} unique manufacturers into `manufacturers`.")

    # Fetch manufacturer_id lookup map
    mfg_id_map: Dict[str, int] = {}
    with engine.connect() as conn:
        for row in conn.execute(text("SELECT id, name FROM manufacturers")):
            mfg_id_map[row[1].lower().strip()] = int(row[0])

    # Drug Classes
    dc_records: Dict[str, Dict[str, Any]] = {}
    used_dc_slugs: Set[str] = set()

    def register_drug_class(raw_name: object, raw_slug: object = None, source_tag: str = "BD-1_DrugClass"):
        name = sanitize_text(raw_name)
        if not name:
            stats.malformed_rows_rejected[source_tag] += 1
            return
        name_trunc = name[:255]
        key = name_trunc.lower().strip()
        if key in dc_records:
            stats.exact_duplicates_dropped[source_tag] += 1
            return
        base_slug = make_slug(raw_slug or name_trunc, fallback_prefix="class")
        slug = base_slug
        counter = 2
        while slug in used_dc_slugs:
            slug = f"{base_slug[:240]}-{counter}"
            counter += 1
        used_dc_slugs.add(slug)
        dc_records[key] = {
            "name": name_trunc,
            "slug": slug[:255],
        }

    for tag, dc_file in [("BD-1_DrugClass", bd1_dir / "drug class.csv"), ("BD-2_DrugClass", bd2_dir / "drug class.csv")]:
        if dc_file.exists():
            df_dc = pd.read_csv(dc_file, dtype=str, encoding="utf-8", on_bad_lines="skip")
            stats.raw_rows_read[tag] += len(df_dc)
            for _, r in df_dc.iterrows():
                register_drug_class(r.get("drug class name") or r.get("name"), r.get("slug"), tag)

    # Also register any drug class referenced in generic.csv
    if (bd1_dir / "generic.csv").exists():
        df_g_dc = pd.read_csv(bd1_dir / "generic.csv", usecols=["drug class"], dtype=str, encoding="utf-8", on_bad_lines="skip")
        for dc_val in df_g_dc["drug class"].dropna().unique():
            register_drug_class(dc_val, None, "BD-1_Generic_DrugClass_Ref")

    dc_list = list(dc_records.values())
    stats.clean_rows_upserted["drug_classes"] = bulk_upsert_mysql(
        engine, DrugClass, dc_list, ["name"]
    )
    print(f"[STEP 4a.2] Upserted {len(dc_list):,} unique therapeutic drug classes into `drug_classes`.")

    dc_id_map: Dict[str, int] = {}
    with engine.connect() as conn:
        for row in conn.execute(text("SELECT id, name FROM drug_classes")):
            dc_id_map[row[1].lower().strip()] = int(row[0])

    # -------------------------------------------------------------------------
    # STEP 4b & 4c: Load Bangladesh `generic.csv` & Enrich with Global Datasets
    # -------------------------------------------------------------------------
    print("[STEP 4b/4c] Deduplicating global pharmacology datasets (INT-1..INT-5) by canonical key...")
    global_enrichment, image_lookup = build_global_clinical_enrichment(stats)
    print(
        f"             Built {len(global_enrichment):,} deduplicated global generic profiles "
        f"& {len(image_lookup):,} composition-form image mappings."
    )

    generic_records: Dict[str, Dict[str, Any]] = {}
    raw_generic_to_canonical: Dict[str, str] = {}

    for tag, gen_file in [("BD-1_Generic", bd1_dir / "generic.csv"), ("BD-2_Generic", bd2_dir / "generic.csv")]:
        if not gen_file.exists():
            continue
        df_gen = pd.read_csv(gen_file, dtype=str, encoding="utf-8", on_bad_lines="skip")
        stats.raw_rows_read[tag] += len(df_gen)

        for _, r in df_gen.iterrows():
            gname = sanitize_text(r.get("generic name") or r.get("name"))
            if not gname:
                stats.malformed_rows_rejected[tag] += 1
                continue
            canonical = normalize_generic_key(gname)
            if not canonical:
                stats.malformed_rows_rejected[tag] += 1
                continue

            raw_generic_to_canonical[gname.lower().strip()] = canonical
            if canonical in generic_records:
                stats.exact_duplicates_dropped[tag] += 1
                continue

            lookup_key = normalize_lookup_generic_key(gname)
            glob = global_enrichment.get(canonical) or global_enrichment.get(lookup_key) or {}
            if glob:
                stats.enrichment_hits["generics_global_enriched"] += 1

            dc_name = sanitize_text(r.get("drug class"))
            dc_id = dc_id_map.get(dc_name[:255].lower().strip()) if dc_name else None

            indication_short = sanitize_text(r.get("indication"))
            indication_desc = sanitize_text(r.get("indication description"))
            if indication_short and indication_desc and indication_short.lower() not in indication_desc.lower():
                full_indication = f"{indication_short}\n\n{indication_desc}"
            else:
                full_indication = indication_desc or indication_short

            pharmacology = sanitize_text(r.get("pharmacology description")) or glob.get("drugbank_description")
            dosage_desc = sanitize_text(r.get("dosage description"))
            admin_desc = sanitize_text(r.get("administration description"))
            if dosage_desc and admin_desc:
                dosage_admin = f"{dosage_desc}\n\nAdministration:\n{admin_desc}"
            else:
                dosage_admin = dosage_desc or admin_desc

            interaction_desc = sanitize_text(r.get("interaction description"))
            contraindications = sanitize_text(r.get("contraindications description"))
            side_effects_text = sanitize_text(r.get("side effects description"))
            preg_lact_text = sanitize_text(r.get("pregnancy and lactation description"))
            precautions = sanitize_text(r.get("precautions description"))
            overdose = sanitize_text(r.get("overdose effects description"))
            storage = sanitize_text(r.get("storage conditions description"))
            monograph_url = sanitize_text(r.get("monograph link"))

            preg_cat = extract_pregnancy_category(glob.get("pregnancy_category"), preg_lact_text)

            side_effects_list = sorted(glob.get("side_effects", set()))
            clinical_uses_list = sorted(glob.get("clinical_uses", set()))
            if indication_short and indication_short not in clinical_uses_list:
                clinical_uses_list.insert(0, indication_short)

            generic_records[canonical] = {
                "generic_name": gname[:500],
                "canonical_name": canonical[:500],
                "drugbank_id": glob.get("drugbank_id"),
                "drug_class_id": dc_id,
                "indication_description": full_indication,
                "pharmacology_description": pharmacology,
                "dosage_administration": dosage_admin,
                "interaction_description": interaction_desc,
                "contraindications": contraindications,
                "side_effects_text": side_effects_text,
                "structured_side_effects": side_effects_list if side_effects_list else None,
                "clinical_uses": clinical_uses_list if clinical_uses_list else None,
                "pregnancy_category": preg_cat,
                "lactation_info": preg_lact_text,
                "precautions": precautions,
                "overdose_effects": overdose,
                "storage_conditions": storage,
                "habit_forming": bool(glob.get("habit_forming", False)),
                "alcohol_interaction": glob.get("alcohol_interaction"),
                "rx_otc_status": glob.get("rx_otc_status"),
                "monograph_url": monograph_url[:500] if monograph_url else None,
            }

    # Ensure every generic referenced in medicine.csv or BD-3 has a valid entry in `generics`
    for med_csv_path in [bd1_dir / "medicine.csv", bd2_dir / "medicine.csv"]:
        if med_csv_path.exists():
            df_mg = pd.read_csv(med_csv_path, usecols=["generic"], dtype=str, encoding="utf-8", on_bad_lines="skip")
            for raw_g in df_mg["generic"].dropna().unique():
                gname = sanitize_text(raw_g)
                if not gname:
                    continue
                canonical = normalize_generic_key(gname)
                if not canonical:
                    continue
                raw_generic_to_canonical[gname.lower().strip()] = canonical
                if canonical not in generic_records:
                    lookup_key = normalize_lookup_generic_key(gname)
                    glob = global_enrichment.get(canonical) or global_enrichment.get(lookup_key) or {}
                    side_effects_list = sorted(glob.get("side_effects", set()))
                    clinical_uses_list = sorted(glob.get("clinical_uses", set()))
                    generic_records[canonical] = {
                        "generic_name": gname[:500],
                        "canonical_name": canonical[:500],
                        "drugbank_id": glob.get("drugbank_id"),
                        "drug_class_id": None,
                        "indication_description": None,
                        "pharmacology_description": glob.get("drugbank_description"),
                        "dosage_administration": None,
                        "interaction_description": None,
                        "contraindications": None,
                        "side_effects_text": None,
                        "structured_side_effects": side_effects_list if side_effects_list else None,
                        "clinical_uses": clinical_uses_list if clinical_uses_list else None,
                        "pregnancy_category": glob.get("pregnancy_category"),
                        "lactation_info": None,
                        "precautions": None,
                        "overdose_effects": None,
                        "storage_conditions": None,
                        "habit_forming": bool(glob.get("habit_forming", False)),
                        "alcohol_interaction": glob.get("alcohol_interaction"),
                        "rx_otc_status": glob.get("rx_otc_status"),
                        "monograph_url": None,
                    }

    if bd3_csv.exists():
        df_mg3 = pd.read_csv(bd3_csv, usecols=["generic_name"], dtype=str, encoding="utf-8", on_bad_lines="skip")
        for raw_g in df_mg3["generic_name"].dropna().unique():
            gname = sanitize_text(raw_g)
            if not gname:
                continue
            canonical = normalize_generic_key(gname)
            if not canonical:
                continue
            raw_generic_to_canonical[gname.lower().strip()] = canonical
            if canonical not in generic_records:
                lookup_key = normalize_lookup_generic_key(gname)
                glob = global_enrichment.get(canonical) or global_enrichment.get(lookup_key) or {}
                side_effects_list = sorted(glob.get("side_effects", set()))
                clinical_uses_list = sorted(glob.get("clinical_uses", set()))
                generic_records[canonical] = {
                    "generic_name": gname[:500],
                    "canonical_name": canonical[:500],
                    "drugbank_id": glob.get("drugbank_id"),
                    "drug_class_id": None,
                    "indication_description": None,
                    "pharmacology_description": glob.get("drugbank_description"),
                    "dosage_administration": None,
                    "interaction_description": None,
                    "contraindications": None,
                    "side_effects_text": None,
                    "structured_side_effects": side_effects_list if side_effects_list else None,
                    "clinical_uses": clinical_uses_list if clinical_uses_list else None,
                    "pregnancy_category": glob.get("pregnancy_category"),
                    "lactation_info": None,
                    "precautions": None,
                    "overdose_effects": None,
                    "storage_conditions": None,
                    "habit_forming": bool(glob.get("habit_forming", False)),
                    "alcohol_interaction": glob.get("alcohol_interaction"),
                    "rx_otc_status": glob.get("rx_otc_status"),
                    "monograph_url": None,
                }

    gen_list = list(generic_records.values())
    stats.clean_rows_upserted["generics"] = bulk_upsert_mysql(
        engine,
        Generic,
        gen_list,
        [
            "generic_name",
            "drugbank_id",
            "drug_class_id",
            "indication_description",
            "pharmacology_description",
            "dosage_administration",
            "interaction_description",
            "contraindications",
            "side_effects_text",
            "structured_side_effects",
            "clinical_uses",
            "pregnancy_category",
            "lactation_info",
            "precautions",
            "overdose_effects",
            "storage_conditions",
            "habit_forming",
            "alcohol_interaction",
            "rx_otc_status",
            "monograph_url",
        ],
    )
    print(
        f"[STEP 4c] Upserted {len(gen_list):,} unique generics into `generics` "
        f"({stats.enrichment_hits['generics_global_enriched']:,} enriched with global clinical data)."
    )

    generic_id_map: Dict[str, int] = {}
    with engine.connect() as conn:
        for row in conn.execute(text("SELECT id, canonical_name FROM generics")):
            generic_id_map[row[1]] = int(row[0])

    # -------------------------------------------------------------------------
    # STEP 4d: Load BD-1 `medicine.csv`, Fill Missing Prices from BD-2 & BD-3,
    #          Compute SHA-256 `dedup_hash`, and Batch-Upsert in Chunks of 2,000
    # -------------------------------------------------------------------------
    # Build BD-3 price fallback lookup (`all_medicine_and_drug_price_data(20k)_Bangladesh.csv`)
    bd3_price_fallback: Dict[Tuple[str, str], Decimal] = {}
    bd3_brand_fallback: Dict[str, Decimal] = {}
    if bd3_csv.exists():
        df_bd3 = pd.read_csv(bd3_csv, dtype=str, encoding="utf-8", on_bad_lines="skip")
        stats.raw_rows_read["BD-3_Price20k"] = len(df_bd3)
        for _, r in df_bd3.iterrows():
            bname = sanitize_text(r.get("medicine_name"))
            strength = sanitize_text(r.get("strength")) or ""
            raw_p = sanitize_text(r.get("price"))
            if not bname or not raw_p:
                continue
            try:
                p_dec = Decimal(raw_p.replace(",", "")).quantize(Decimal("0.01"))
                if p_dec > Decimal("0.00"):
                    b_key = bname.lower().strip()
                    s_key = strength.lower().strip()
                    bd3_price_fallback[(b_key, s_key)] = p_dec
                    if b_key not in bd3_brand_fallback:
                        bd3_brand_fallback[b_key] = p_dec
            except Exception:
                pass

    medicines_by_hash: Dict[str, Dict[str, Any]] = {}
    seen_composite_keys: Set[str] = set()
    used_med_slugs: Set[str] = set()

    def ingest_medicine_row(
        brand_raw: object,
        mtype_raw: object,
        slug_raw: object,
        form_raw: object,
        generic_raw: object,
        strength_raw: object,
        mfg_raw: object,
        pkg_container_raw: object,
        pkg_size_raw: object,
        explicit_price_raw: object,
        source_label: str,
        stats_key: str,
    ):
        brand = sanitize_text(brand_raw)
        generic_str = sanitize_text(generic_raw)
        if not brand or not generic_str:
            stats.malformed_rows_rejected[stats_key] += 1
            return

        form = sanitize_text(form_raw) or "Tablet"
        strength = sanitize_text(strength_raw)
        mfg = sanitize_text(mfg_raw)
        mtype = (sanitize_text(mtype_raw) or "Allopathic").title()

        comp_key = compute_composite_key(brand, form, strength, mfg)
        dedup_hash = compute_dedup_hash(brand, form, strength, mfg)

        pkg_container = sanitize_text(pkg_container_raw)
        pkg_size = sanitize_text(pkg_size_raw)
        combined_pkg = " ".join(x for x in (pkg_container, pkg_size) if x).strip() or None

        unit_price, strip_price = extract_bdt_prices(combined_pkg)
        if unit_price is None and explicit_price_raw is not None:
            unit_price, _ = extract_bdt_prices(f"Unit Price: ৳ {explicit_price_raw}")

        # Fallback to BD-3 price if missing in primary record
        if unit_price is None:
            b_low = brand.lower().strip()
            s_low = (strength or "").lower().strip()
            if (b_low, s_low) in bd3_price_fallback:
                unit_price = bd3_price_fallback[(b_low, s_low)]
                stats.enrichment_hits["bd3_price_fallback_filled"] += 1
            elif b_low in bd3_brand_fallback:
                unit_price = bd3_brand_fallback[b_low]
                stats.enrichment_hits["bd3_price_fallback_filled"] += 1

        # Check deduplication
        if dedup_hash in medicines_by_hash or comp_key in seen_composite_keys:
            stats.exact_duplicates_dropped[stats_key] += 1
            # Fill missing price on existing BD-1 record if secondary source has price
            existing = medicines_by_hash.get(dedup_hash)
            if existing:
                if existing["unit_price_bdt"] is None and unit_price is not None:
                    existing["unit_price_bdt"] = unit_price
                if existing["strip_price_bdt"] is None and strip_price is not None:
                    existing["strip_price_bdt"] = strip_price
            return

        # Resolve generic_id FK
        canonical_g = raw_generic_to_canonical.get(generic_str.lower().strip()) or normalize_generic_key(generic_str)
        generic_id = generic_id_map.get(canonical_g)
        if not generic_id:
            stats.malformed_rows_rejected[stats_key] += 1
            return

        # Resolve manufacturer_id FK
        mfg_id = mfg_id_map.get(mfg.lower().strip()) if mfg else None

        # Resolve dosage form icon & reference package image
        icon_key = normalize_dosage_form_icon(form)
        lookup_g = normalize_lookup_generic_key(generic_str)
        ref_img = image_lookup.get((lookup_g, icon_key))

        # Unique slug generation
        base_slug = make_slug(
            slug_raw or f"{brand}-{form}-{strength or ''}",
            fallback_prefix="med",
        )
        slug = base_slug
        if slug in used_med_slugs:
            slug = f"{base_slug[:280]}-{dedup_hash[:8]}"
        used_med_slugs.add(slug)
        seen_composite_keys.add(comp_key)

        medicines_by_hash[dedup_hash] = {
            "brand_name": brand[:255],
            "slug": slug[:300],
            "dedup_hash": dedup_hash,
            "medicine_type": mtype[:50],
            "dosage_form": form[:100],
            "strength": strength[:255] if strength else None,
            "generic_id": generic_id,
            "manufacturer_id": mfg_id,
            "unit_price_bdt": unit_price,
            "strip_price_bdt": strip_price,
            "pack_size_info": combined_pkg,
            "reference_image_url": ref_img,
            "dosage_form_icon": icon_key,
            "is_active": True,
            "data_source": source_label,
        }

    # 1. Primary Source: BD-1 (`bd_1_assorted/medicine.csv`)
    bd1_med_csv = bd1_dir / "medicine.csv"
    if bd1_med_csv.exists():
        df_m1 = pd.read_csv(bd1_med_csv, dtype=str, encoding="utf-8", on_bad_lines="skip")
        stats.raw_rows_read["BD-1_Medicine"] = len(df_m1)
        for _, r in df_m1.iterrows():
            ingest_medicine_row(
                brand_raw=r.get("brand name"),
                mtype_raw=r.get("type"),
                slug_raw=r.get("slug"),
                form_raw=r.get("dosage form"),
                generic_raw=r.get("generic"),
                strength_raw=r.get("strength"),
                mfg_raw=r.get("manufacturer"),
                pkg_container_raw=r.get("package container"),
                pkg_size_raw=r.get("Package Size"),
                explicit_price_raw=None,
                source_label="MedEx_BD_Verified",
                stats_key="BD-1_Medicine",
            )

    # 2. Secondary Verification Source: BD-2 (`bd_2_rajib/medicine.csv`)
    bd2_med_csv = bd2_dir / "medicine.csv"
    if bd2_med_csv.exists():
        df_m2 = pd.read_csv(bd2_med_csv, dtype=str, encoding="utf-8", on_bad_lines="skip")
        stats.raw_rows_read["BD-2_Medicine"] = len(df_m2)
        for _, r in df_m2.iterrows():
            ingest_medicine_row(
                brand_raw=r.get("brand name"),
                mtype_raw=r.get("type"),
                slug_raw=r.get("slug"),
                form_raw=r.get("dosage form"),
                generic_raw=r.get("generic"),
                strength_raw=r.get("strength"),
                mfg_raw=r.get("manufacturer"),
                pkg_container_raw=r.get("package container"),
                pkg_size_raw=r.get("Package Size"),
                explicit_price_raw=None,
                source_label="MedEx_BD2_Verified",
                stats_key="BD-2_Medicine",
            )

    # 3. Price & Brand Fallback Source: BD-3 (`all_medicine_and_drug_price_data(20k)_Bangladesh.csv`)
    if bd3_csv.exists():
        df_m3 = pd.read_csv(bd3_csv, dtype=str, encoding="utf-8", on_bad_lines="skip")
        for _, r in df_m3.iterrows():
            unit_lbl = sanitize_text(r.get("unit")) or "Unit"
            unit_sz = sanitize_text(r.get("unit_size")) or "1"
            raw_p = sanitize_text(r.get("price"))
            pkg_str = f"Unit Price: ৳ {raw_p} ({unit_lbl}: {unit_sz})" if raw_p else None
            ingest_medicine_row(
                brand_raw=r.get("medicine_name"),
                mtype_raw="Allopathic",
                slug_raw=r.get("slug"),
                form_raw=r.get("category_name"),
                generic_raw=r.get("generic_name"),
                strength_raw=r.get("strength"),
                mfg_raw=r.get("manufacturer_name"),
                pkg_container_raw=pkg_str,
                pkg_size_raw=None,
                explicit_price_raw=raw_p,
                source_label="BD_Price20k_Verified",
                stats_key="BD-3_Price20k",
            )

    med_list = list(medicines_by_hash.values())
    stats.clean_rows_upserted["medicines"] = bulk_upsert_mysql(
        engine,
        Medicine,
        med_list,
        [
            "brand_name",
            "medicine_type",
            "dosage_form",
            "strength",
            "generic_id",
            "manufacturer_id",
            "unit_price_bdt",
            "strip_price_bdt",
            "pack_size_info",
            "reference_image_url",
            "dosage_form_icon",
            "is_active",
            "data_source",
        ],
    )
    elapsed = time.time() - start_ts
    print(
        f"[STEP 4d] Upserted {len(med_list):,} unique deduplicated Bangladeshi medicines "
        f"in chunks of {BATCH_CHUNK_SIZE:,} rows ({elapsed:.1f}s)."
    )

    # Save audit summary JSON in `oxpecker_med_etl/data/processed/etl_audit_summary.json`
    DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    summary_payload = {
        "database": MYSQL_DB,
        "elapsed_seconds": round(elapsed, 2),
        "raw_rows_read": dict(stats.raw_rows_read),
        "exact_duplicates_dropped": dict(stats.exact_duplicates_dropped),
        "malformed_rows_rejected": dict(stats.malformed_rows_rejected),
        "clean_rows_upserted": dict(stats.clean_rows_upserted),
        "enrichment_hits": dict(stats.enrichment_hits),
    }
    with open(DATA_PROCESSED_DIR / "etl_audit_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary_payload, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 80)
    print("ETL AUDIT LOG SUMMARY")
    print("=" * 80)
    print(json.dumps(summary_payload, indent=2))
    print("=" * 80)
    return stats, summary_payload


if __name__ == "__main__":
    run_etl()
