from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey

from app.database.database import Base


class Like(Base):

    __tablename__ = "likes"

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