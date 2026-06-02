from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Boolean

from datetime import datetime

from app.database.database import Base


class Notification(Base):

    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    message = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    is_read = Column(
        Boolean,
        default=False
    )