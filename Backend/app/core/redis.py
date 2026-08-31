"""Async Redis client with graceful fallback.

If Redis is unavailable at startup the application continues to run
without caching.  ``get_redis()`` will return ``None`` in that case,
and callers should handle it accordingly.
"""

from __future__ import annotations

import redis.asyncio as redis

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

redis_client: redis.Redis | None = None


async def init_redis() -> None:
    """Initialize the global Redis connection.

    Called once during application startup.  If the connection fails the
    client is set to ``None`` and a warning is logged.
    """
    global redis_client
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
        await redis_client.ping()
        logger.info("Redis connected at %s", settings.REDIS_URL)
    except Exception:
        logger.warning(
            "Redis unavailable at %s - caching disabled.",
            settings.REDIS_URL,
        )
        redis_client = None


async def close_redis() -> None:
    """Gracefully close the Redis connection pool."""
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None
        logger.info("Redis connection closed.")


async def get_redis() -> redis.Redis | None:
    """Return the active Redis client, or ``None`` if unavailable."""
    return redis_client
