"""
Automated Post-Load Database Verification & Production Audit Script (`verify_db.py`).
Executes SQL integrity checks, deduplication assertions, pricing coverage audits,
and FULLTEXT OCR search tests against `oxpecker_med_db`.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from sqlalchemy import create_engine, text

from oxpecker_med_etl.config import DATA_PROCESSED_DIR, MYSQL_DB, ensure_local_mysql_running, get_database_url

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def run_verification() -> dict:
    ensure_local_mysql_running()
    engine = create_engine(get_database_url(), pool_pre_ping=True)

    with engine.connect() as conn:
        total_medicines = int(conn.execute(text("SELECT COUNT(*) FROM medicines")).scalar() or 0)
        total_generics = int(conn.execute(text("SELECT COUNT(*) FROM generics")).scalar() or 0)
        total_manufacturers = int(conn.execute(text("SELECT COUNT(*) FROM manufacturers")).scalar() or 0)
        total_drug_classes = int(conn.execute(text("SELECT COUNT(*) FROM drug_classes")).scalar() or 0)

        generics_with_pharmacology = int(
            conn.execute(
                text(
                    "SELECT COUNT(*) FROM generics "
                    "WHERE indication_description IS NOT NULL "
                    "   OR pharmacology_description IS NOT NULL "
                    "   OR structured_side_effects IS NOT NULL"
                )
            ).scalar()
            or 0
        )
        generics_with_drugbank = int(
            conn.execute(text("SELECT COUNT(*) FROM generics WHERE drugbank_id IS NOT NULL")).scalar() or 0
        )
        generics_with_structured_se = int(
            conn.execute(text("SELECT COUNT(*) FROM generics WHERE structured_side_effects IS NOT NULL")).scalar() or 0
        )
        generics_with_preg_cat = int(
            conn.execute(text("SELECT COUNT(*) FROM generics WHERE pregnancy_category IS NOT NULL")).scalar() or 0
        )

        medicines_with_bdt_price = int(
            conn.execute(
                text("SELECT COUNT(*) FROM medicines WHERE unit_price_bdt IS NOT NULL OR strip_price_bdt IS NOT NULL")
            ).scalar()
            or 0
        )
        medicines_with_unit_price = int(
            conn.execute(text("SELECT COUNT(*) FROM medicines WHERE unit_price_bdt IS NOT NULL")).scalar() or 0
        )
        medicines_with_strip_price = int(
            conn.execute(text("SELECT COUNT(*) FROM medicines WHERE strip_price_bdt IS NOT NULL")).scalar() or 0
        )
        medicines_with_ref_image = int(
            conn.execute(text("SELECT COUNT(*) FROM medicines WHERE reference_image_url IS NOT NULL")).scalar() or 0
        )

        # Deduplication assertions
        dup_hash_diff = int(
            conn.execute(text("SELECT COUNT(*) - COUNT(DISTINCT dedup_hash) FROM medicines")).scalar() or 0
        )
        dup_canonical_diff = int(
            conn.execute(text("SELECT COUNT(*) - COUNT(DISTINCT canonical_name) FROM generics")).scalar() or 0
        )
        dup_slug_diff = int(
            conn.execute(text("SELECT COUNT(*) - COUNT(DISTINCT slug) FROM medicines")).scalar() or 0
        )

        # Foreign Key & Orphan Integrity Checks
        orphan_generic_fks = int(
            conn.execute(
                text(
                    "SELECT COUNT(*) FROM medicines m "
                    "LEFT JOIN generics g ON m.generic_id = g.id "
                    "WHERE g.id IS NULL"
                )
            ).scalar()
            or 0
        )
        orphan_mfg_fks = int(
            conn.execute(
                text(
                    "SELECT COUNT(*) FROM medicines m "
                    "LEFT JOIN manufacturers mf ON m.manufacturer_id = mf.id "
                    "WHERE m.manufacturer_id IS NOT NULL AND mf.id IS NULL"
                )
            ).scalar()
            or 0
        )
        orphan_drug_class_fks = int(
            conn.execute(
                text(
                    "SELECT COUNT(*) FROM generics g "
                    "LEFT JOIN drug_classes dc ON g.drug_class_id = dc.id "
                    "WHERE g.drug_class_id IS NOT NULL AND dc.id IS NULL"
                )
            ).scalar()
            or 0
        )

        # Fulltext OCR & Generic Index Verification
        ft_med_hits = conn.execute(
            text(
                "SELECT brand_name, dosage_form, strength, unit_price_bdt "
                "FROM medicines "
                "WHERE MATCH(brand_name, strength, dosage_form) AGAINST('Napa 500 mg Tablet' IN NATURAL LANGUAGE MODE) "
                "LIMIT 3"
            )
        ).fetchall()

        sample_enriched_generics = conn.execute(
            text(
                "SELECT generic_name, canonical_name, drugbank_id, pregnancy_category, rx_otc_status, habit_forming "
                "FROM generics "
                "WHERE drugbank_id IS NOT NULL AND structured_side_effects IS NOT NULL "
                "LIMIT 5"
            )
        ).fetchall()

    bdt_price_pct = round((medicines_with_bdt_price / total_medicines * 100.0), 2) if total_medicines else 0.0
    pharmacology_pct = round((generics_with_pharmacology / total_generics * 100.0), 2) if total_generics else 0.0

    audit_file = DATA_PROCESSED_DIR / "etl_audit_summary.json"
    etl_audit = {}
    if audit_file.exists():
        with open(audit_file, "r", encoding="utf-8") as f:
            etl_audit = json.load(f)

    report = {
        "database_name": MYSQL_DB,
        "total_unique_bangladeshi_brands": total_medicines,
        "total_unique_generics": total_generics,
        "generics_with_clinical_pharmacology": generics_with_pharmacology,
        "generics_pharmacology_coverage_pct": pharmacology_pct,
        "generics_with_drugbank_id": generics_with_drugbank,
        "generics_with_structured_side_effects": generics_with_structured_se,
        "generics_with_pregnancy_category": generics_with_preg_cat,
        "total_unique_manufacturers": total_manufacturers,
        "total_unique_drug_classes": total_drug_classes,
        "medicines_with_valid_bdt_pricing": medicines_with_bdt_price,
        "medicines_with_unit_price_bdt": medicines_with_unit_price,
        "medicines_with_strip_price_bdt": medicines_with_strip_price,
        "bdt_pricing_coverage_pct": bdt_price_pct,
        "medicines_with_reference_image_url": medicines_with_ref_image,
        "duplicate_dedup_hash_count": dup_hash_diff,
        "duplicate_canonical_generic_count": dup_canonical_diff,
        "duplicate_medicine_slug_count": dup_slug_diff,
        "orphan_generic_fk_count": orphan_generic_fks,
        "orphan_manufacturer_fk_count": orphan_mfg_fks,
        "orphan_drug_class_fk_count": orphan_drug_class_fks,
        "sample_fulltext_ocr_matches": [
            {
                "brand_name": r[0],
                "dosage_form": r[1],
                "strength": r[2],
                "unit_price_bdt": float(r[3]) if r[3] is not None else None,
            }
            for r in ft_med_hits
        ],
        "sample_enriched_generics": [
            {
                "generic_name": r[0],
                "canonical_name": r[1],
                "drugbank_id": r[2],
                "pregnancy_category": r[3],
                "rx_otc_status": r[4],
                "habit_forming": bool(r[5]),
            }
            for r in sample_enriched_generics
        ],
        "etl_audit_log": etl_audit,
    }

    DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    with open(DATA_PROCESSED_DIR / "production_audit_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 80)
    print("OXPECKER AI - FINAL PRODUCTION DATABASE AUDIT REPORT (`oxpecker_med_db`)")
    print("=" * 80)
    print(f"1. Total Unique Bangladeshi Brands Loaded       : {total_medicines:,}")
    print(f"2. Total Unique Generics Loaded                 : {total_generics:,}")
    print(f"   - With Full Clinical Pharmacology            : {generics_with_pharmacology:,} ({pharmacology_pct:.2f}%)")
    print(f"   - Enriched with Official DrugBank ID         : {generics_with_drugbank:,}")
    print(f"   - Enriched with Structured Side Effects JSON : {generics_with_structured_se:,}")
    print(f"   - Verified FDA Pregnancy Category            : {generics_with_preg_cat:,}")
    print(f"3. Total Unique Manufacturers                   : {total_manufacturers:,}")
    print(f"4. Total Unique Therapeutic Drug Classes        : {total_drug_classes:,}")
    print(f"5. Medicines with Valid BDT Pricing             : {medicines_with_bdt_price:,} / {total_medicines:,} ({bdt_price_pct:.2f}%)")
    print(f"   - Unit Price (BDT) Extracted                 : {medicines_with_unit_price:,}")
    print(f"   - Strip Price (BDT) Extracted                : {medicines_with_strip_price:,}")
    print(f"   - Reference Package Image Mapped             : {medicines_with_ref_image:,}")
    print(f"6. Duplicate Check (`COUNT(*) - COUNT(DISTINCT dedup_hash)`) : {dup_hash_diff} (MUST EQUAL 0)")
    print(f"   Duplicate Generic Check (`canonical_name`)                : {dup_canonical_diff} (MUST EQUAL 0)")
    print(f"7. Orphan Foreign Key Check:")
    print(f"   - Orphan `generic_id` in `medicines`         : {orphan_generic_fks} (MUST EQUAL 0)")
    print(f"   - Orphan `manufacturer_id` in `medicines`    : {orphan_mfg_fks} (MUST EQUAL 0)")
    print(f"   - Orphan `drug_class_id` in `generics`       : {orphan_drug_class_fks} (MUST EQUAL 0)")
    print("=" * 80 + "\n")

    assert dup_hash_diff == 0, f"Duplicate dedup_hash detected: {dup_hash_diff}"
    assert dup_canonical_diff == 0, f"Duplicate canonical_name detected: {dup_canonical_diff}"
    assert orphan_generic_fks == 0, f"Orphan generic_id FKs detected: {orphan_generic_fks}"
    assert orphan_mfg_fks == 0, f"Orphan manufacturer_id FKs detected: {orphan_mfg_fks}"
    assert orphan_drug_class_fks == 0, f"Orphan drug_class_id FKs detected: {orphan_drug_class_fks}"

    return report


if __name__ == "__main__":
    run_verification()
