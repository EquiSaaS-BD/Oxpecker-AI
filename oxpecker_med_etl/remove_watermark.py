import os
import sys
import json

sys.path.insert(0, r"E:\Oxpecker-AI-main\Oxpecker-AI-main")
from oxpecker_med_etl.config import get_database_url, ensure_local_mysql_running
from sqlalchemy import create_engine, text

def main():
    ensure_local_mysql_running()
    engine = create_engine(get_database_url())
    with engine.begin() as conn:
        before = conn.execute(text("SELECT count(*) FROM medicines WHERE reference_image_url LIKE '%l_watermark_346%'")).scalar()
        print(f"Watermarked URLs in DB before: {before}")
        if before > 0:
            updated = conn.execute(text("UPDATE medicines SET reference_image_url = REPLACE(reference_image_url, 'l_watermark_346,w_480,h_480/', '') WHERE reference_image_url LIKE '%l_watermark_346%'")).rowcount
            print(f"Updated rows in DB: {updated}")
        after = conn.execute(text("SELECT count(*) FROM medicines WHERE reference_image_url LIKE '%l_watermark_346%'")).scalar()
        print(f"Watermarked URLs in DB after: {after}")

    # Now update Frontend/public/data/medicines.json
    json_path = r"E:\Oxpecker-AI-main\Oxpecker-AI-main\Frontend\public\data\medicines.json"
    if os.path.exists(json_path):
        print(f"Updating {json_path}...")
        with open(json_path, "r", encoding="utf-8") as f:
            obj = json.load(f)
        
        items = obj["data"] if isinstance(obj, dict) and "data" in obj else obj
        count_mod = 0
        for item in items:
            img = item.get("reference_image_url")
            if img and "l_watermark_346,w_480,h_480/" in img:
                item["reference_image_url"] = img.replace("l_watermark_346,w_480,h_480/", "")
                count_mod += 1
        
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
        print(f"Updated {count_mod} records in medicines.json")

if __name__ == "__main__":
    main()
