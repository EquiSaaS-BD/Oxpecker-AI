"""
Database & Path Configuration for Oxpecker AI Medicine ETL Pipeline.
Reads credentials from environment variables or .env file.
"""
from __future__ import annotations

import atexit
import os
import socket
import subprocess
import time
from pathlib import Path
from typing import Optional
from urllib.parse import quote_plus
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"
LOCAL_MYSQL_DATA_DIR = BASE_DIR / "data" / "mysql_datadir"
REPO_ROOT = BASE_DIR.parent

load_dotenv(BASE_DIR / ".env")

MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_DB = os.getenv("MYSQL_DB", "oxpecker_med_db")

BATCH_CHUNK_SIZE = int(os.getenv("ETL_BATCH_SIZE", "2000"))

MYSQLD_CANDIDATES = [
    Path(r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"),
    Path(r"C:\xampp\mysql\bin\mysqld.exe"),
]


def is_port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex((host, port)) == 0


def ensure_local_mysql_running() -> Optional[subprocess.Popen]:
    """
    Ensure a MySQL 8.0 server is listening on MYSQL_HOST:MYSQL_PORT.
    If not running locally, automatically initializes and starts mysqld.exe.
    """
    if is_port_open(MYSQL_HOST, MYSQL_PORT):
        return None

    mysqld_bin = next((p for p in MYSQLD_CANDIDATES if p.exists()), None)
    if not mysqld_bin:
        return None

    if not (LOCAL_MYSQL_DATA_DIR / "mysql").exists():
        LOCAL_MYSQL_DATA_DIR.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [
                str(mysqld_bin),
                "--initialize-insecure",
                f"--datadir={LOCAL_MYSQL_DATA_DIR}",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    proc = subprocess.Popen(
        [
            str(mysqld_bin),
            f"--datadir={LOCAL_MYSQL_DATA_DIR}",
            f"--port={MYSQL_PORT}",
            "--mysqlx=0",
            f"--bind-address={MYSQL_HOST}",
            "--innodb-buffer-pool-size=256M",
            "--max-allowed-packet=64M",
        ],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    def _cleanup_mysqld():
        if proc.poll() is None:
            mysqladmin_bin = mysqld_bin.parent / "mysqladmin.exe"
            if mysqladmin_bin.exists():
                subprocess.run(
                    [str(mysqladmin_bin), f"--host={MYSQL_HOST}", f"--port={MYSQL_PORT}", f"--user={MYSQL_USER}", "shutdown"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
            try:
                proc.wait(timeout=5)
            except Exception:
                proc.terminate()

    atexit.register(_cleanup_mysqld)

    for _ in range(30):
        if is_port_open(MYSQL_HOST, MYSQL_PORT):
            return proc
        time.sleep(0.5)

    return proc


def get_mysql_server_url() -> str:
    """Return SQLAlchemy connection URL to MySQL server without database name."""
    pwd = f":{quote_plus(MYSQL_PASSWORD)}" if MYSQL_PASSWORD else ":"
    return f"mysql+pymysql://{MYSQL_USER}{pwd}@{MYSQL_HOST}:{MYSQL_PORT}/?charset=utf8mb4"


def get_database_url() -> str:
    """Return SQLAlchemy connection URL for the target oxpecker_med_db database."""
    env_url = os.getenv("OXPECKER_MED_DATABASE_URL")
    if env_url:
        return env_url
    pwd = f":{quote_plus(MYSQL_PASSWORD)}" if MYSQL_PASSWORD else ":"
    return (
        f"mysql+pymysql://{MYSQL_USER}{pwd}@{MYSQL_HOST}:{MYSQL_PORT}/"
        f"{MYSQL_DB}?charset=utf8mb4"
    )
