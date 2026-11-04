"""
Dataset Downloader & Header Inspector for Oxpecker AI Medicine ETL Pipeline.
Downloads verified Bangladesh (BD-1..BD-4) and International (INT-1..INT-5)
datasets from Kaggle API v1 / kagglehub and GitHub into `data/raw/`.
"""
from __future__ import annotations

import csv
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
from typing import Dict, List

import requests

from oxpecker_med_etl.config import DATA_RAW_DIR

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

KAGGLE_DATASETS: Dict[str, Dict[str, str]] = {
    "bd_1_assorted": {
        "kaggle_id": "ahmedshahriarsakib/assorted-medicine-dataset-of-bangladesh",
        "description": "BD-1 Assorted Medicine Dataset of Bangladesh (Primary BD Source)",
    },
    "bd_2_rajib": {
        "kaggle_id": "rajibdpi/medicine-data-of-bangladesh",
        "description": "BD-2 Medicine Dataset of Bangladesh (Secondary Verification)",
    },
    "bd_3_price_20k": {
        "kaggle_id": "toriqulstu/all-medicine-and-drug-price-data20k-bangladesh",
        "description": "BD-3 All Medicine and Drug Price Data 20k Bangladesh (Price Fallback)",
    },
    "bd_4_composition": {
        "kaggle_id": "ibrahimrifat/medicine-name-strength-composition",
        "description": "BD-4 Bangladesh Medicine Brands Dataset MedEx (Composition Cross-Check)",
    },
    "int_1_250k_usage": {
        "kaggle_id": "shudhanshusingh/250k-medicines-usage-side-effects-and-substitutes",
        "description": "INT-1 250k Medicines Usage, Side Effects and Substitutes",
    },
    "int_2_az_india": {
        "kaggle_id": "shudhanshusingh/az-medicine-dataset-of-india",
        "description": "INT-2 A-Z Medicine Dataset (250k+ Exact Salt Composition)",
    },
    "int_3_drugs_com": {
        "kaggle_id": "jithinanievarghese/drugs-side-effects-and-medical-condition",
        "description": "INT-3 Drugs, Side Effects and Medical Condition (Drugs.com Verified)",
    },
    "int_5_images_11k": {
        "kaggle_id": "singhnavjot2062001/11000-medicine-details",
        "description": "INT-5 11000 Medicine Details with Reference Package Image URLs",
    },
}

GITHUB_REPOS: Dict[str, Dict[str, str]] = {
    "int_4_drugbank": {
        "repo_url": "https://github.com/dhimmel/drugbank.git",
        "description": "INT-4 DrugBank Standardized International Pharmacology Repository",
    },
}


def download_kaggle_dataset(folder_key: str, kaggle_id: str, description: str) -> Path:
    """Download and extract a Kaggle dataset into DATA_RAW_DIR / folder_key."""
    target_dir = DATA_RAW_DIR / folder_key
    target_dir.mkdir(parents=True, exist_ok=True)

    existing_files = [
        p for p in target_dir.rglob("*")
        if p.is_file() and p.suffix.lower() in {".csv", ".tsv", ".json"}
    ]
    if existing_files:
        print(f"[SKIP] {description} already extracted ({len(existing_files)} data files in {target_dir.name})")
        return target_dir

    # Try kagglehub first if installed
    try:
        import kagglehub  # type: ignore
        print(f"[KAGGLEHUB] Downloading {kaggle_id} ...")
        cached_path = Path(kagglehub.dataset_download(kaggle_id))
        for item in cached_path.rglob("*"):
            if item.is_file():
                shutil.copy2(item, target_dir / item.name)
        print(f"[OK] Copied {kaggle_id} via kagglehub -> {target_dir}")
        return target_dir
    except Exception:
        pass

    # Direct Kaggle API v1 public stream download
    url = f"https://www.kaggle.com/api/v1/datasets/download/{kaggle_id}"
    zip_path = DATA_RAW_DIR / f"{folder_key}.zip"
    print(f"[DOWNLOAD] {description}\n           URL: {url}")

    with requests.get(url, stream=True, timeout=120) as resp:
        resp.raise_for_status()
        with open(zip_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=1024 * 256):
                if chunk:
                    f.write(chunk)

    print(f"[EXTRACT] Extracting {zip_path.name} ({zip_path.stat().st_size / 1024:.1f} KB) -> {target_dir}")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(target_dir)
    zip_path.unlink(missing_ok=True)
    return target_dir


def clone_github_repo(folder_key: str, repo_url: str, description: str) -> Path:
    """Shallow-clone a GitHub repository into DATA_RAW_DIR / folder_key."""
    target_dir = DATA_RAW_DIR / folder_key
    if target_dir.exists() and any(target_dir.iterdir()):
        print(f"[SKIP] {description} already cloned in {target_dir.name}")
        return target_dir

    print(f"[GIT CLONE] {description}\n            Repo: {repo_url}")
    subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, str(target_dir)],
        check=True,
    )
    return target_dir


def inspect_headers() -> Dict[str, List[str]]:
    """Inspect and print exact CSV/TSV column headers across all downloaded files."""
    print("\n" + "=" * 80)
    print("DATASET MANIFEST & COLUMN HEADER INSPECTION")
    print("=" * 80)
    summary: Dict[str, List[str]] = {}
    for file_path in sorted(DATA_RAW_DIR.rglob("*")):
        if not file_path.is_file():
            continue
        ext = file_path.suffix.lower()
        if ext not in {".csv", ".tsv"}:
            continue
        rel = str(file_path.relative_to(DATA_RAW_DIR))
        delimiter = "\t" if ext == ".tsv" else ","
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace", newline="") as f:
                reader = csv.reader(f, delimiter=delimiter)
                headers = next(reader, [])
                row_count = sum(1 for _ in reader)
            summary[rel] = headers
            print(f"\nFile: {rel} (rows: {row_count:,})")
            print(f"  Headers ({len(headers)}): {headers[:15]}{' ...' if len(headers) > 15 else ''}")
        except Exception as exc:
            print(f"\nFile: {rel} -> Error reading headers: {exc}")
    print("=" * 80 + "\n")
    return summary


def run_downloads() -> Dict[str, List[str]]:
    DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    for folder_key, meta in KAGGLE_DATASETS.items():
        try:
            download_kaggle_dataset(folder_key, meta["kaggle_id"], meta["description"])
        except Exception as exc:
            print(f"[WARN] Failed to download {folder_key} ({meta['kaggle_id']}): {exc}")

    for folder_key, meta in GITHUB_REPOS.items():
        try:
            clone_github_repo(folder_key, meta["repo_url"], meta["description"])
        except Exception as exc:
            print(f"[WARN] Failed to clone {folder_key} ({meta['repo_url']}): {exc}")

    return inspect_headers()


if __name__ == "__main__":
    run_downloads()
