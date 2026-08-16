import asyncio
import asyncpg
import sys

async def test():
    users = ['postgres', 'Rafin']
    passwords = ['postgres', 'admin', 'root', '1234', '12345', '123456', '']
    
    for u in users:
        for p in passwords:
            try:
                conn = await asyncpg.connect(
                    user=u,
                    password=p,
                    host='localhost',
                    port=5432,
                    database='postgres'
                )
                print(f"SUCCESS: user '{u}', password '{p}'")
                await conn.close()
                return
            except Exception as e:
                pass
    
    print("FAILED: All common combinations failed")
    sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test())
