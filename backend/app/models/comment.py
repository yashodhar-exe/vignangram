from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class Comment(Base):

    __tablename__ = "comments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    post_id = Column(
        Integer,
        ForeignKey("posts.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    content = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )