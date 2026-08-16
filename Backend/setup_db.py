import asyncio
import aiomysql
import sys

async def setup():
    try:
        # Connect to MySQL server (without specifying DB so we can create it)
        conn = await aiomysql.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='',
            autocommit=True
        )
        print("Connected to MySQL successfully!")
        
        async with conn.cursor() as cur:
            # Create DB
            await cur.execute("CREATE DATABASE IF NOT EXISTS shustota_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("Database shustota_db ensured.")
            
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(setup())
