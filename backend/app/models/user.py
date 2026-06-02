from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import Date
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    roll_number = Column(
        String,
        unique=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    branch = Column(
        String,
        nullable=False
    )

    academic_year = Column(
        String,
        nullable=False
    )

    section = Column(
        String,
        nullable=False
    )

    dob = Column(
        String,
        nullable=False
    )

    gender = Column(
        String,
        nullable=False
    )

    profile_picture = Column(
        String,
        nullable=True
    )

    bio = Column(
        String,
        default=""
    )

    is_verified = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )