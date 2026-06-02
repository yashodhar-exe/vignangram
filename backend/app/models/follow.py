from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey

from app.database.database import Base


class Follow(Base):

    __tablename__ = "follows"

    id = Column(
        Integer,
        primary_key=True
    )

    follower_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    following_id = Column(
        Integer,
        ForeignKey("users.id")
    )