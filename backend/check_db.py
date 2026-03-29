import asyncio
import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from app.db.session import engine
from sqlalchemy import text

async def check_db():
    async with engine.connect() as conn:
        print("--- Tables ---")
        tables = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        for row in tables:
            print(row[0])
            
        print("\n--- Types ---")
        types = await conn.execute(text("SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public'"))
        for row in types:
            print(row[0])

if __name__ == "__main__":
    asyncio.run(check_db())
