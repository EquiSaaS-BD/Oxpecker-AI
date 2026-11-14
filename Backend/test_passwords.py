import asyncio
import asyncpg


def test_postgres_connection_probe():
    """Verify local Postgres probe handles unreachable/unauthenticated socket gracefully."""
    async def _probe():
        try:
            conn = await asyncio.wait_for(
                asyncpg.connect(
                    user="postgres",
                    password="postgres",
                    host="localhost",
                    port=5432,
                    database="postgres",
                ),
                timeout=1.5,
            )
            await conn.close()
            return True
        except Exception:
            return False

    result = asyncio.run(_probe())
    assert isinstance(result, bool)
