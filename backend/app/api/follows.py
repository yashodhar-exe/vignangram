from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.follow import Follow
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(
    prefix="/follows",
    tags=["Follows"]
)


@router.post("/{follower_id}/{following_id}")
def follow_user(
    follower_id: int,
    following_id: int,
    db: Session = Depends(get_db)
):

    if follower_id == following_id:

        raise HTTPException(
            status_code=400,
            detail="Cannot follow yourself"
        )

    follower = db.query(User).filter(
        User.id == follower_id
    ).first()

    following = db.query(User).filter(
        User.id == following_id
    ).first()

    if not follower or not following:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_follow = db.query(Follow).filter(
        Follow.follower_id == follower_id,
        Follow.following_id == following_id
    ).first()

    if existing_follow:

        return {
            "message": "Already following"
        }

    follow = Follow(
        follower_id=follower_id,
        following_id=following_id
    )

    db.add(follow)

    notification = Notification(
        user_id=following_id,
        message=f"{follower.name} started following you"
    )

    db.add(notification)

    db.commit()

    return {
        "message": "Followed successfully"
    }


@router.delete("/{follower_id}/{following_id}")
def unfollow_user(
    follower_id: int,
    following_id: int,
    db: Session = Depends(get_db)
):

    follow = db.query(Follow).filter(
        Follow.follower_id == follower_id,
        Follow.following_id == following_id
    ).first()

    if not follow:

        raise HTTPException(
            status_code=404,
            detail="Follow relationship not found"
        )

    db.delete(follow)

    db.commit()

    return {
        "message": "Unfollowed successfully"
    }


@router.get("/followers/{user_id}")
def get_followers(
    user_id: int,
    db: Session = Depends(get_db)
):

    followers = db.query(Follow).filter(
        Follow.following_id == user_id
    ).all()

    return followers


@router.get("/following/{user_id}")
def get_following(
    user_id: int,
    db: Session = Depends(get_db)
):

    following = db.query(Follow).filter(
        Follow.follower_id == user_id
    ).all()

    return following