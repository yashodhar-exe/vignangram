from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.like import Like

router = APIRouter(
    prefix="/likes",
    tags=["Likes"]
)


@router.post("/{post_id}/{user_id}")
def like_post(
    post_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    existing = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == user_id
    ).first()

    if existing:

        return {
            "message":
            "Already liked"
        }

    like = Like(
        post_id=post_id,
        user_id=user_id
    )

    db.add(like)

    db.commit()

    return {
        "message":
        "Post liked"
    }


@router.get("/{post_id}")
def get_likes(
    post_id: int,
    db: Session = Depends(get_db)
):

    count = db.query(Like).filter(
        Like.post_id == post_id
    ).count()

    return {
        "likes": count
    }