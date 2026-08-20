"""Centralized logging configuration.

Call ``setup_logging()`` once at application startup (in ``main.py``).
Use ``get_logger(__name__)`` in every module to obtain a properly-named
logger instance.
"""

from __future__ import annotations

import logging
import sys


def setup_logging() -> None:
    """Configure the root logger with a structured, human-readable format.

    Noisy third-party loggers (uvicorn access, SQLAlchemy engine) are
    suppressed to WARNING level so application logs stay readable.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    # Suppress noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a logger for the given module *name*.

    Usage::

        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.info("Hello from %s", __name__)
    """
    return logging.getLogger(name)
