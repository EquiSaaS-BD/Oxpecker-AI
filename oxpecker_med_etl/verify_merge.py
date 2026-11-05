"""
Post-merge verification script for Oxpecker AI Medicine Database.
Verifies:
1. Exact count = 28,151
2. 0 duplicate 5-field keys
3. Spot-checks: Napa, Seclo, Sergel, Adovas, 5X
4. Frontend dataset integrity
"""
import json
import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from oxpecker_med_etl.config import ensure_local_mysql_running, get_database_url
from oxpecker_med_etl.merge_mediguard import compute_5field_key
from sqlalchemy import create_engine, text

def main():
    ensure_local_mysql_running()
    engine = create_engine(get_database_url())

    print("=== STEP 1: VERIFYING DATABASE RECORD COUNTS ===")
    with engine.connect() as conn:
        med_count = conn.execute(text("SELECT count(*) FROM medicines")).scalar()
        gen_count = conn.execute(text("SELECT count(*) FROM generics")).scalar()
        mfg_count = conn.execute(text("SELECT count(*) FROM manufacturers")).scalar()
        print(f"Medicines count: {med_count} (Expected: 28151)")
        print(f"Generics count: {gen_count} (Expected: 2029)")
        print(f"Manufacturers count: {mfg_count}")
        assert med_count == 28151, f"Expected 28151 medicines, got {med_count}"
        assert gen_count == 2029, f"Expected 2029 generics, got {gen_count}"

        print("\n=== STEP 2: VERIFYING ZERO DUPLICATES UNDER 5-FIELD KEY ===")
        sql = """
            SELECT m.brand_name, g.generic_name, m.strength, m.dosage_form, man.name as manufacturer_name
            FROM medicines m
            LEFT JOIN generics g ON m.generic_id = g.id
            LEFT JOIN manufacturers man ON m.manufacturer_id = man.id
        """
        rows = conn.execute(text(sql)).mappings().all()
        seen_keys = set()
        duplicates = []
        for r in rows:
            k = compute_5field_key(r['brand_name'], r['generic_name'], r['strength'], r['dosage_form'], r['manufacturer_name'])
            if k in seen_keys:
                duplicates.append((k, r['brand_name']))
            seen_keys.add(k)
        print(f"Total keys checked: {len(rows)}")
        print(f"Unique keys: {len(seen_keys)}")
        print(f"Duplicates found: {len(duplicates)}")
        if duplicates:
            print("Duplicates list:", duplicates[:5])
        assert len(duplicates) == 0, f"Found {len(duplicates)} duplicates!"

        print("\n=== STEP 3: SPOT-CHECKING BENCHMARK MEDICINES ===")
        targets = ["Napa", "Seclo", "Sergel", "Adovas", "5X"]
        for target in targets:
            found = conn.execute(
                text("SELECT m.id, m.brand_name, g.generic_name, m.strength, m.dosage_form, man.name as manufacturer, m.unit_price_bdt, m.data_source FROM medicines m JOIN generics g ON m.generic_id = g.id JOIN manufacturers man ON m.manufacturer_id = man.id WHERE m.brand_name = :b LIMIT 2"),
                {"b": target}
            ).mappings().all()
            print(f"Target [{target}]: found {len(found)} rows")
            for f in found:
                print(f"  -> ID {f['id']}: {f['brand_name']} ({f['generic_name']}) {f['strength'] or ''} {f['dosage_form']} by {f['manufacturer']} (Price: {f['unit_price_bdt']}, Source: {f['data_source']})")
            assert len(found) > 0, f"Benchmark medicine {target} not found!"

    print("\n=== STEP 4: VERIFYING FRONTEND DATASETS ===")
    fe_med_file = REPO_ROOT / "Frontend" / "public" / "data" / "medicines.json"
    fe_gen_file = REPO_ROOT / "Frontend" / "public" / "data" / "generics.json"
    assert fe_med_file.exists(), "Frontend medicines.json missing!"
    assert fe_gen_file.exists(), "Frontend generics.json missing!"

    with fe_med_file.open(encoding="utf-8") as f:
        fe_med_data = json.load(f)
    print(f"Frontend medicines.json count: {fe_med_data['total_count']} (Data list len: {len(fe_med_data['data'])})")
    assert fe_med_data['total_count'] == 28151
    assert len(fe_med_data['data']) == 28151

    with fe_gen_file.open(encoding="utf-8") as f:
        fe_gen_data = json.load(f)
    print(f"Frontend generics.json count: {fe_gen_data['total_count']} (Data list len: {len(fe_gen_data['data'])})")
    assert fe_gen_data['total_count'] == 2029

    print("\n>>> ALL VERIFICATION CHECKS PASSED WITH ZERO DUPLICATES! <<<")

if __name__ == "__main__":
    main()
