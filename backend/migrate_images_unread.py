import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import engine
from sqlalchemy import text

def run_migration():
    print("Running migration to add image_url, is_read, and last_read_at columns...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE messages ADD COLUMN image_url VARCHAR;"))
        except Exception as e:
            print(f"Skipping messages.image_url: {e}")
            
        try:
            conn.execute(text("ALTER TABLE community_messages ADD COLUMN image_url VARCHAR;"))
        except Exception as e:
            print(f"Skipping community_messages.image_url: {e}")

        try:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;"))
        except Exception as e:
            print(f"Skipping notifications.is_read: {e}")

        try:
            conn.execute(text("ALTER TABLE community_members ADD COLUMN last_read_at TIMESTAMP WITHOUT TIME ZONE DEFAULT '1970-01-01 00:00:00';"))
        except Exception as e:
            print(f"Skipping community_members.last_read_at: {e}")
            
        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    run_migration()
