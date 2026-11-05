"""
Applies all 371 MediGuard AI medicines into oxpecker_med_db.
Total final medicines = 28,155.
Data source for these 371 medicines = 'MediGuard_AI'.
Synchronizes Frontend/public/data/medicines.json and generics.json.
"""
import csv
import datetime
import json
import re
import sys
import unicodedata
from pathlib import Path
from decimal import Decimal

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
    sanitize_text,
)
from oxpecker_med_etl.merge_mediguard import export_frontend_datasets, compute_5field_key, normalize_text
from sqlalchemy import create_engine, text

KAGGLE_CSV = Path(r"E:\Oxpecker-AI-main\mediguard_source\backend\data\catalogue\raw\kaggle\medicine.csv")

def main():
    ensure_local_mysql_running()
    engine = create_engine(get_database_url())

    print("=== Loading MediGuard Kaggle Data ===")
    with KAGGLE_CSV.open("r", encoding="utf-8-sig") as f:
        k_rows = list(csv.DictReader(f))

    with engine.connect() as conn:
        # First remove any previous temporary MediGuard rows
        conn.execute(text("DELETE FROM medicines WHERE data_source IN ('MediGuard_Merge', 'MediGuard_AI')"))
        
        orig_medicines = conn.execute(text("""
            SELECT m.id, m.brand_name, g.generic_name, m.strength, m.dosage_form, man.name as manufacturer_name
            FROM medicines m
            LEFT JOIN generics g ON m.generic_id = g.id
            LEFT JOIN manufacturers man ON m.manufacturer_id = man.id
        """)).mappings().all()

        orig_keys = set(compute_5field_key(
            r["brand_name"], r["generic_name"], r["strength"], r["dosage_form"], r["manufacturer_name"]
        ) for r in orig_medicines)
        
        print(f"Base Oxpecker medicines count: {len(orig_medicines)}")

    # Identify the 371 MediGuard unique formulations
    seen_k = set()
    new_records = []
    for r in k_rows:
        b = r["brand name"].strip()
        g = r["generic"].strip()
        s = r["strength"].strip() if r["strength"] else ""
        d = r["dosage form"].strip()
        m = r["manufacturer"].strip() if r["manufacturer"] else ""

        if not b or not g or not d:
            continue

        k = compute_5field_key(b, g, s, d, m)
        if k in seen_k:
            continue
        seen_k.add(k)

        if k not in orig_keys:
            new_records.append(r)

    print(f"MediGuard items to insert: {len(new_records)} (Expected: 371)")
    assert len(new_records) == 371, f"Expected 371, got {len(new_records)}"

    print("Beginning atomic transaction to insert 371 MediGuard AI medicines...")
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM medicines WHERE data_source IN ('MediGuard_Merge', 'MediGuard_AI')"))
        # Load existing generics and manufacturers
        gen_rows = conn.execute(text("SELECT id, generic_name, canonical_name FROM generics")).mappings().all()
        gen_map = {g["generic_name"].strip().lower(): g["id"] for g in gen_rows}
        gen_canon_map = {g["canonical_name"].strip().lower(): g["id"] for g in gen_rows}

        mfg_rows = conn.execute(text("SELECT id, name FROM manufacturers")).mappings().all()
        mfg_map = {re.sub(r"\s+", " ", m["name"].strip().lower()): m["id"] for m in mfg_rows}

        existing_slugs = set(r[0] for r in conn.execute(text("SELECT slug FROM medicines")).all())
        existing_hashes = set(r[0] for r in conn.execute(text("SELECT dedup_hash FROM medicines")).all())

        inserted = 0
        for r in new_records:
            b_raw = r["brand name"].strip()
            g_raw = r["generic"].strip()
            s_raw = r["strength"].strip() if r["strength"] else None
            d_raw = r["dosage form"].strip()
            m_raw = r["manufacturer"].strip() if r["manufacturer"] else None
            mtype = r.get("type", "Allopathic").capitalize() if r.get("type") else "Allopathic"

            pkg = r.get("package container", "")
            pkg_size = r.get("Package Size", "")
            unit_p, strip_p = extract_bdt_prices(pkg)
            pack_info = pkg if pkg else pkg_size
            if pack_info:
                pack_info = sanitize_text(pack_info)

            # Generic lookup or insert
            clean_g_name = g_raw.strip().lower()
            gid = gen_map.get(clean_g_name) or gen_canon_map.get(clean_g_name)
            if not gid:
                # Insert specific generic monograph entry for MediGuard formulation
                canon_name = clean_g_name
                conn.execute(
                    text("INSERT INTO generics (generic_name, canonical_name) VALUES (:name, :canon)"),
                    {"name": g_raw, "canon": canon_name}
                )
                gid = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                gen_map[clean_g_name] = gid
                gen_canon_map[canon_name] = gid

            # Manufacturer lookup or insert
            mid = None
            if m_raw:
                clean_m = re.sub(r"\s+", " ", m_raw.strip().lower())
                mid = mfg_map.get(clean_m)
                if not mid:
                    m_slug = make_slug(m_raw, fallback_prefix="mfg")
                    conn.execute(
                        text("INSERT INTO manufacturers (name, slug, country) VALUES (:name, :slug, 'Bangladesh')"),
                        {"name": m_raw, "slug": m_slug}
                    )
                    mid = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                    mfg_map[clean_m] = mid

            # Unique slug & dedup hash
            raw_slug = r.get("slug") or f"{b_raw}-{d_raw}-{s_raw or ''}"
            slug = make_slug(raw_slug, fallback_prefix="med")
            counter = 1
            original_slug = slug
            while slug in existing_slugs:
                slug = make_slug(f"{original_slug}-mg{counter}")
                counter += 1
            existing_slugs.add(slug)

            d_hash = compute_dedup_hash(b_raw, d_raw, s_raw, m_raw)
            h_counter = 1
            original_hash = d_hash
            while d_hash in existing_hashes:
                d_hash = compute_dedup_hash(b_raw, d_raw, f"{s_raw or ''}-mg{h_counter}", m_raw)
                h_counter += 1
            existing_hashes.add(d_hash)

            icon = normalize_dosage_form_icon(d_raw)

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
                    1, 'MediGuard_AI'
                )
            """
            conn.execute(
                text(insert_sql),
                {
                    "brand_name": b_raw,
                    "slug": slug,
                    "dedup_hash": d_hash,
                    "medicine_type": mtype,
                    "dosage_form": d_raw,
                    "strength": s_raw,
                    "generic_id": gid,
                    "manufacturer_id": mid,
                    "unit_price_bdt": unit_p,
                    "strip_price_bdt": strip_p,
                    "pack_size_info": pack_info,
                    "dosage_form_icon": icon,
                }
            )
            inserted += 1

        print(f"Successfully inserted {inserted} MediGuard AI medicines.")

    with engine.connect() as conn:
        final_count = conn.execute(text("SELECT count(*) FROM medicines")).scalar()
        print(f"Final medicines in database: {final_count} (Expected: 28155)")
        assert final_count == 28155, f"Expected 28155, got {final_count}"

        fe_med, fe_gen = export_frontend_datasets(conn)
        print(f"Exported to Frontend: {fe_med} medicines, {fe_gen} generics.")

    print("\n>>> ALL 371 MEDIGUARD AI MEDICINES APPLIED & VERIFIED PERFECTLY! <<<")

if __name__ == "__main__":
    main()
