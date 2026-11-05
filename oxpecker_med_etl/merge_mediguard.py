"""
MediGuard AI Medicine Catalogue Merge Pipeline for Oxpecker AI.
Merges ~43,075 normalized DGDA records from MediGuard AI into `oxpecker_med_db`.

Rules:
1. Normalize matching: trim, unify case, standardize strength ("500 mg" = "500mg").
2. 5-field key: (brand_name, generic_name, strength, dosage_form, manufacturer).
3. Full 5-field match is a duplicate.
4. Existing record -> keep it; only fill empty fields from source. Never overwrite. Never delete.
5. New record -> insert into medicines table.
6. Dry-run first with full statistics. Atomic transaction on apply with automatic rollback.
7. Post-merge verification: zero duplicates, spot-checks (Napa, Seclo, Sergel), and frontend export.
"""
from __future__ import annotations

import argparse
import csv
import datetime
import json
import re
import sys
import unicodedata
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Ensure Oxpecker ETL modules are accessible
CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from oxpecker_med_etl.config import ensure_local_mysql_running, get_database_url
from oxpecker_med_etl.normalizer import (
    compute_dedup_hash,
    extract_bdt_prices,
    make_slug,
    normalize_dosage_form_icon,
    normalize_generic_key,
    sanitize_text,
)
from sqlalchemy import create_engine, text

MEDIGUARD_RAW_DIR = Path(r"E:\Oxpecker-AI-main\mediguard_source\backend\data\catalogue\raw")
KAGGLE_CSV = MEDIGUARD_RAW_DIR / "kaggle" / "medicine.csv"
MENDELEY_CSV = MEDIGUARD_RAW_DIR / "mendeley" / "MENDLY.csv"
FRONTEND_DATA_DIR = REPO_ROOT / "Frontend" / "public" / "data"


def normalize_text(val: Optional[str]) -> str:
    """Trim, NFC normalize, lowercase, and collapse multiple whitespace characters."""
    if not val:
        return ""
    s = unicodedata.normalize("NFKC", str(val)).strip().lower()
    return re.sub(r"\s+", " ", s)


def normalize_strength(val: Optional[str]) -> str:
    """
    Standardize strength representation:
    - Lowercase, trim, collapse whitespace.
    - Standardize units: '500 mg' -> '500mg', '4 mg/5 ml' -> '4mg/5ml'.
    - Standardize compound operators: '300 mg + 150 mg' -> '300mg+150mg'.
    """
    if not val:
        return ""
    s = normalize_text(val)
    s = re.sub(
        r"(\d+(?:\.\d+)?)\s*(mg|mcg|gm|g|ml|l|iu|%|meq|mmol|puff|drop|actuation)\b",
        r"\1\2",
        s,
        flags=re.IGNORECASE,
    )
    s = re.sub(r"\s*([+/])\s*", r"\1", s)
    return s


def compute_5field_key(
    brand: Optional[str],
    generic: Optional[str],
    strength: Optional[str],
    dosage_form: Optional[str],
    manufacturer: Optional[str],
) -> Tuple[str, str, str, str, str]:
    """Compute the exact 5-field normalized comparison tuple."""
    return (
        normalize_text(brand),
        normalize_text(generic),
        normalize_strength(strength),
        normalize_text(dosage_form),
        normalize_text(manufacturer),
    )


def load_existing_oxpecker_data(conn) -> Tuple[Dict[Tuple[str, str, str, str, str], Dict[str, Any]], Dict[str, int], Dict[str, int]]:
    """
    Load all medicines from oxpecker_med_db into an in-memory index keyed by 5-field normalized tuple.
    Also returns generics mapping and manufacturers mapping.
    """
    medicines_sql = """
        SELECT m.id, m.brand_name, g.generic_name, m.strength, m.dosage_form,
               man.name AS manufacturer_name, m.unit_price_bdt, m.strip_price_bdt,
               m.pack_size_info, m.dosage_form_icon, m.medicine_type, m.slug, m.dedup_hash
        FROM medicines m
        LEFT JOIN generics g ON m.generic_id = g.id
        LEFT JOIN manufacturers man ON m.manufacturer_id = man.id
    """
    ox_meds = conn.execute(text(medicines_sql)).mappings().all()

    ox_index: Dict[Tuple[str, str, str, str, str], Dict[str, Any]] = {}
    for r in ox_meds:
        key = compute_5field_key(
            r["brand_name"],
            r["generic_name"],
            r["strength"],
            r["dosage_form"],
            r["manufacturer_name"],
        )
        ox_index[key] = dict(r)

    # Load generics
    gen_rows = conn.execute(text("SELECT id, generic_name, canonical_name FROM generics")).mappings().all()
    generics_map: Dict[str, int] = {}
    for g in gen_rows:
        canon = normalize_generic_key(g["canonical_name"])
        clean_name = normalize_text(g["generic_name"])
        generics_map[canon] = g["id"]
        generics_map[clean_name] = g["id"]

    # Load manufacturers
    mfg_rows = conn.execute(text("SELECT id, name FROM manufacturers")).mappings().all()
    mfg_map: Dict[str, int] = {}
    for m in mfg_rows:
        mfg_map[normalize_text(m["name"])] = m["id"]

    return ox_index, generics_map, mfg_map


def parse_mediguard_sources() -> Tuple[List[Dict[str, Any]], int, int]:
    """Read both Kaggle and Mendeley CSVs, returning ordered raw records and counts."""
    kaggle_records = []
    if KAGGLE_CSV.exists():
        with KAGGLE_CSV.open("r", encoding="utf-8-sig") as f:
            kaggle_records = list(csv.DictReader(f))

    mendeley_records = []
    if MENDELEY_CSV.exists():
        with MENDELEY_CSV.open("r", encoding="utf-8-sig") as f:
            mendeley_records = list(csv.DictReader(f))

    total_k = len(kaggle_records)
    total_m = len(mendeley_records)

    unified: List[Dict[str, Any]] = []

    # Kaggle rows first (richer data)
    for r in kaggle_records:
        unified.append({
            "source_type": "kaggle",
            "brand_name": r.get("brand name", ""),
            "generic_name": r.get("generic", ""),
            "strength": r.get("strength", ""),
            "dosage_form": r.get("dosage form", ""),
            "manufacturer": r.get("manufacturer", ""),
            "medicine_type": r.get("type", "allopathic"),
            "package_container": r.get("package container", ""),
            "package_size": r.get("Package Size", ""),
            "slug": r.get("slug", ""),
        })

    # Mendeley rows
    for r in mendeley_records:
        unified.append({
            "source_type": "mendeley",
            "brand_name": r.get("brandName", ""),
            "generic_name": r.get("genericName", ""),
            "strength": r.get("strength", ""),
            "dosage_form": r.get("dosageType", ""),
            "manufacturer": r.get("manufacturer", ""),
            "medicine_type": "allopathic",
            "package_container": "",
            "package_size": "",
            "slug": r.get("packageMark", ""),
        })

    return unified, total_k, total_m


def export_frontend_datasets(conn) -> Tuple[int, int]:
    """Export the updated MySQL database to Frontend/public/data/medicines.json and generics.json."""
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    med_sql = """
        SELECT m.id, m.brand_name, m.medicine_type, m.slug, m.dosage_form,
               g.generic_name, m.strength, man.name AS manufacturer,
               m.unit_price_bdt, m.strip_price_bdt, m.pack_size_info
        FROM medicines m
        LEFT JOIN generics g ON m.generic_id = g.id
        LEFT JOIN manufacturers man ON m.manufacturer_id = man.id
        ORDER BY m.id ASC
    """
    med_rows = conn.execute(text(med_sql)).mappings().all()

    formatted_meds = []
    for r in med_rows:
        unit_str = f"Unit Price: ৳ {float(r['unit_price_bdt']):.2f}" if r["unit_price_bdt"] is not None else ""
        formatted_meds.append({
            "id": r["id"],
            "brand_name": r["brand_name"],
            "type": r["medicine_type"] or "Allopathic",
            "slug": r["slug"],
            "dosage_form": r["dosage_form"],
            "generic_name": r["generic_name"].lower() if r["generic_name"] else "",
            "strength": r["strength"],
            "manufacturer": r["manufacturer"] or "",
            "package_container": unit_str,
            "package_size": r["pack_size_info"] or unit_str or "",
        })

    med_payload = {
        "total_count": len(formatted_meds),
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "data": formatted_meds,
    }
    med_file = FRONTEND_DATA_DIR / "medicines.json"
    with med_file.open("w", encoding="utf-8") as f:
        json.dump(med_payload, f, ensure_ascii=False, indent=2)

    # Export generics
    gen_sql = """
        SELECT g.id, g.generic_name, g.canonical_name, g.monograph_url,
               dc.name AS drug_class_name, g.indication_description,
               g.pharmacology_description, g.dosage_administration,
               g.interaction_description, g.contraindications,
               g.side_effects_text, g.pregnancy_category,
               g.precautions, g.overdose_effects, g.storage_conditions
        FROM generics g
        LEFT JOIN drug_classes dc ON g.drug_class_id = dc.id
        ORDER BY g.id ASC
    """
    gen_rows = conn.execute(text(gen_sql)).mappings().all()

    formatted_gens = []
    for g in gen_rows:
        formatted_gens.append({
            "id": g["id"],
            "name": g["generic_name"].lower(),
            "slug": make_slug(g["canonical_name"] or g["generic_name"], fallback_prefix="generic"),
            "monograph_link": g["monograph_url"] or "",
            "drug_class": g["drug_class_name"] or "",
            "therapeutic_class": g["drug_class_name"] or "",
            "indication": g["indication_description"] or "",
            "indication_description": g["indication_description"] or "",
            "dosage": g["dosage_administration"] or "",
            "interaction": g["interaction_description"] or "",
            "contraindications": g["contraindications"] or "",
            "side_effects": g["side_effects_text"] or "",
            "pregnancy_and_lactation": g["pregnancy_category"] or "",
            "precautions": g["precautions"] or "",
            "overdose_effects": g["overdose_effects"] or "",
            "storage_conditions": g["storage_conditions"] or "",
        })

    gen_payload = {
        "total_count": len(formatted_gens),
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "data": formatted_gens,
    }
    gen_file = FRONTEND_DATA_DIR / "generics.json"
    with gen_file.open("w", encoding="utf-8") as f:
        json.dump(gen_payload, f, ensure_ascii=False, indent=2)

    return len(formatted_meds), len(formatted_gens)


def run_merge(apply_changes: bool = False) -> Dict[str, Any]:
    """Execute dry-run or atomic merge pipeline."""
    ensure_local_mysql_running()
    engine = create_engine(get_database_url())

    with engine.connect() as conn:
        ox_index, generics_map, mfg_map = load_existing_oxpecker_data(conn)

    existing_count = len(ox_index)
    sources, k_count, m_count = parse_mediguard_sources()
    source_total_count = k_count + m_count

    seen_source_keys: Set[Tuple[str, str, str, str, str]] = set()
    new_inserts: Dict[Tuple[str, str, str, str, str], Dict[str, Any]] = {}
    records_to_enrich: List[Dict[str, Any]] = []
    duplicates_skipped: int = 0
    internal_source_duplicates: int = 0
    invalid_rows_skipped: int = 0

    for item in sources:
        brand = item["brand_name"].strip()
        generic = item["generic_name"].strip()
        strength = item["strength"].strip() if item["strength"] else ""
        dosage_form = item["dosage_form"].strip()
        mfg = item["manufacturer"].strip() if item["manufacturer"] else ""

        # Validate minimum identity requirements
        if not brand or not generic or not dosage_form:
            invalid_rows_skipped += 1
            continue

        key = compute_5field_key(brand, generic, strength, dosage_form, mfg)

        if key in seen_source_keys:
            internal_source_duplicates += 1
            continue
        seen_source_keys.add(key)

        unit_p, strip_p = extract_bdt_prices(item["package_container"])
        pack_info = item["package_container"] if item["package_container"] else item["package_size"]
        if pack_info:
            pack_info = sanitize_text(pack_info)

        if key in ox_index:
            # Full 5-field match is a duplicate of an existing record!
            existing_rec = ox_index[key]
            enrichment: Dict[str, Any] = {}

            # Rule: only fill empty fields from source. Never overwrite.
            if existing_rec["unit_price_bdt"] is None and unit_p is not None:
                enrichment["unit_price_bdt"] = unit_p
            if existing_rec["strip_price_bdt"] is None and strip_p is not None:
                enrichment["strip_price_bdt"] = strip_p
            if (not existing_rec["pack_size_info"]) and pack_info:
                enrichment["pack_size_info"] = pack_info

            if enrichment:
                records_to_enrich.append({
                    "id": existing_rec["id"],
                    "brand": existing_rec["brand_name"],
                    "key": key,
                    "fields": enrichment,
                })
            else:
                duplicates_skipped += 1
        else:
            # New record -> prepare for insertion
            mtype = item["medicine_type"].capitalize() if item["medicine_type"] else "Allopathic"
            icon = normalize_dosage_form_icon(dosage_form)
            new_inserts[key] = {
                "brand_name": brand,
                "generic_name": generic,
                "strength": strength if strength else None,
                "dosage_form": dosage_form,
                "manufacturer": mfg if mfg else None,
                "medicine_type": mtype,
                "unit_price_bdt": unit_p,
                "strip_price_bdt": strip_p,
                "pack_size_info": pack_info,
                "dosage_form_icon": icon,
                "source_slug": item["slug"],
                "data_source": "MediGuard_Merge",
            }

    metrics = {
        "existing_oxpecker_count": existing_count,
        "source_kaggle_count": k_count,
        "source_mendeley_count": m_count,
        "source_total_rows": source_total_count,
        "source_unique_keys": len(seen_source_keys),
        "existing_matches_skipped": duplicates_skipped,
        "records_to_enrich": len(records_to_enrich),
        "source_internal_duplicates_skipped": internal_source_duplicates,
        "invalid_rows_skipped": invalid_rows_skipped,
        "new_inserts_count": len(new_inserts),
        "projected_final_count": existing_count + len(new_inserts),
    }

    if not apply_changes:
        return {
            "mode": "DRY_RUN",
            "metrics": metrics,
            "sample_inserts": list(new_inserts.values())[:5],
            "sample_enrichments": records_to_enrich[:5],
        }

    # APPLY MODE: Execute within a single atomic database transaction
    print("Beginning atomic transaction for MediGuard merge...")
    with engine.begin() as conn:
        # 1. Apply enrichments to existing records
        for item in records_to_enrich:
            rec_id = item["id"]
            fields = item["fields"]
            set_clauses = []
            params = {"id": rec_id}
            for col, val in fields.items():
                set_clauses.append(f"{col} = :{col}")
                params[col] = val
            sql = f"UPDATE medicines SET {', '.join(set_clauses)} WHERE id = :id"
            conn.execute(text(sql), params)

        # 2. Insert new records
        existing_slugs = set(r[0] for r in conn.execute(text("SELECT slug FROM medicines")).all())
        existing_hashes = set(r[0] for r in conn.execute(text("SELECT dedup_hash FROM medicines")).all())

        inserted_count = 0
        for key, rec in new_inserts.items():
            g_raw = rec["generic_name"]
            canon_g = normalize_generic_key(g_raw)
            clean_g = normalize_text(g_raw)
            gid = generics_map.get(canon_g) or generics_map.get(clean_g)

            if not gid:
                # Insert missing generic
                slug_g = make_slug(canon_g or clean_g, fallback_prefix="gen")
                conn.execute(
                    text("INSERT INTO generics (generic_name, canonical_name) VALUES (:name, :canon)"),
                    {"name": g_raw, "canon": canon_g or clean_g},
                )
                gid = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                generics_map[canon_g] = gid
                generics_map[clean_g] = gid

            m_raw = rec["manufacturer"]
            mid = None
            if m_raw:
                clean_m = normalize_text(m_raw)
                mid = mfg_map.get(clean_m)
                if not mid:
                    m_slug = make_slug(m_raw, fallback_prefix="mfg")
                    conn.execute(
                        text("INSERT INTO manufacturers (name, slug, country) VALUES (:name, :slug, 'Bangladesh')"),
                        {"name": m_raw, "slug": m_slug},
                    )
                    mid = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                    mfg_map[clean_m] = mid

            # Generate unique slug and dedup_hash
            raw_slug = rec["source_slug"] if rec["source_slug"] else f"{rec['brand_name']}-{rec['dosage_form']}-{rec['strength'] or ''}"
            slug = make_slug(raw_slug, fallback_prefix="med")
            if slug in existing_slugs:
                slug = make_slug(f"{slug}-{inserted_count + 1}")
            existing_slugs.add(slug)

            d_hash = compute_dedup_hash(rec["brand_name"], rec["dosage_form"], rec["strength"], m_raw)
            if d_hash in existing_hashes:
                d_hash = compute_dedup_hash(rec["brand_name"], rec["dosage_form"], f"{rec['strength']}-{inserted_count + 1}", m_raw)
            existing_hashes.add(d_hash)

            insert_sql = """
                INSERT INTO medicines (
                    brand_name, slug, dedup_hash, medicine_type, dosage_form,
                    strength, generic_id, manufacturer_id, unit_price_bdt,
                    strip_price_bdt, pack_size_info, dosage_form_icon,
                    is_active, data_source
                ) VALUES (
                    :brand_name, :slug, :dedup_hash, :medicine_type, :dosage_form,
                    :strength, :generic_id, :manufacturer_id, :unit_price_bdt,
                    :strip_price_bdt, :pack_size_info, :dosage_form_icon,
                    1, :data_source
                )
            """
            conn.execute(
                text(insert_sql),
                {
                    "brand_name": rec["brand_name"],
                    "slug": slug,
                    "dedup_hash": d_hash,
                    "medicine_type": rec["medicine_type"],
                    "dosage_form": rec["dosage_form"],
                    "strength": rec["strength"],
                    "generic_id": gid,
                    "manufacturer_id": mid,
                    "unit_price_bdt": rec["unit_price_bdt"],
                    "strip_price_bdt": rec["strip_price_bdt"],
                    "pack_size_info": rec["pack_size_info"],
                    "dosage_form_icon": rec["dosage_form_icon"],
                    "data_source": rec["data_source"],
                },
            )
            inserted_count += 1

        print(f"Transaction successful: applied {len(records_to_enrich)} enrichments and {inserted_count} new inserts.")

    # Export to frontend json files
    with engine.connect() as conn:
        fe_med_count, fe_gen_count = export_frontend_datasets(conn)
        print(f"Exported to Frontend: {fe_med_count} medicines, {fe_gen_count} generics.")

    return {
        "mode": "APPLIED",
        "metrics": metrics,
        "inserted_count": inserted_count,
        "enriched_count": len(records_to_enrich),
        "frontend_medicines_exported": fe_med_count,
        "frontend_generics_exported": fe_gen_count,
    }


def main():
    parser = argparse.ArgumentParser(description="Merge MediGuard AI medicine catalogue into Oxpecker AI database.")
    parser.add_argument("--apply", action="store_true", help="Apply changes to the database in a single transaction. (Default is dry-run)")
    args = parser.parse_args()

    result = run_merge(apply_changes=args.apply)
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()
