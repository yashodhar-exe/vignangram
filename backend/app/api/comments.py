from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.comment import Comment

from app.schemas.comment import (
    CommentCreate
)

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)


@router.post("/{post_id}/{user_id}")
def add_comment(
    post_id: int,
    user_id: int,
    request: CommentCreate,
    db: Session = Depends(get_db)
):

    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=request.content
    )

    db.add(comment)

    db.commit()

    db.refresh(comment)

    return comment


@router.get("/{post_id}")
def get_comments(
    post_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Comment).filter(
        Comment.post_id == post_id
    ).all()