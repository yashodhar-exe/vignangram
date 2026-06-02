from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from app.database.database import Base


class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True) # None means system-generated
    created_at = Column(DateTime, default=datetime.utcnow)


class CommunityMember(Base):
    __tablename__ = "community_members"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_read_at = Column(DateTime, default=datetime.utcnow)


class CommunityMessage(Base):
    __tablename__ = "community_messages"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=True) # allow empty content for image only
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
