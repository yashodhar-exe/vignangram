from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class OTP(Base):

    __tablename__ = "otp"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        nullable=False
    )

    otp_code = Column(
        String,
        nullable=False
    )

    purpose = Column(
        String,
        nullable=False
    )

    is_used = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )