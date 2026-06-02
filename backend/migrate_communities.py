import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import engine
from app.models.user import User
from app.models.community import Community, CommunityMember, CommunityMessage

def run_migration():
    print("Creating community tables...")
    Community.metadata.create_all(bind=engine)
    CommunityMember.metadata.create_all(bind=engine)
    CommunityMessage.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    run_migration()
