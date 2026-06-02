import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy import create_engine

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def run_migration():
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;"))
        print("Migration successful")

if __name__ == "__main__":
    run_migration()
