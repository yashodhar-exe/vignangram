from sqlalchemy import or_

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import UploadFile, File
from pydantic import BaseModel
from app.utils.storage import upload_file_to_supabase

from app.core.config import BASE_URL
from app.core.security import get_current_user

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User
from app.models.follow import Follow
from app.models.post import Post
from app.models.like import Like
from app.models.comment import Comment
from app.models.message import Message
from app.models.notification import Notification
from app.models.community import Community, CommunityMember, CommunityMessage

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_all_users(
    db: Session = Depends(get_db)
):

    return db.query(User).all()


@router.get("/{user_id}")
def get_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    followers = db.query(Follow).filter(
        Follow.following_id == user_id
    ).count()

    following = db.query(Follow).filter(
        Follow.follower_id == user_id
    ).count()

    posts = db.query(Post).filter(
        Post.user_id == user_id
    ).count()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "bio": user.bio,
        "profile_picture": user.profile_picture,
        "followers": followers,
        "following": following,
        "posts": posts
    }


@router.get("/search/{query}")
def search_users(
    query: str,
    db: Session = Depends(get_db)
):

    users = db.query(User).filter(
        or_(
            User.name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%")
        )
    ).all()

    return users

class UpdateProfileRequest(BaseModel):
    name: str
    bio: str

@router.put("/me")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.name = request.name
    current_user.bio = request.bio
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/profile_picture")
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = upload_file_to_supabase(file, "profiles")
        
    current_user.profile_picture = image_url
    db.commit()
    db.refresh(current_user)
    
    return {"profile_picture": current_user.profile_picture}

@router.get("/email/{email}")
def get_user_by_email(
    email: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

@router.delete("/me")
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    uid = current_user.id
    
    # 1. Likes made by user
    db.query(Like).filter(Like.user_id == uid).delete(synchronize_session=False)
    # 2. Comments made by user
    db.query(Comment).filter(Comment.user_id == uid).delete(synchronize_session=False)
    
    # 3. All likes/comments on user's posts
    user_posts = db.query(Post).filter(Post.user_id == uid).all()
    post_ids = [p.id for p in user_posts]
    if post_ids:
        db.query(Like).filter(Like.post_id.in_(post_ids)).delete(synchronize_session=False)
        db.query(Comment).filter(Comment.post_id.in_(post_ids)).delete(synchronize_session=False)
        # 4. The user's posts
        db.query(Post).filter(Post.user_id == uid).delete(synchronize_session=False)

    # 5. Messages
    db.query(Message).filter(or_(Message.sender_id == uid, Message.receiver_id == uid)).delete(synchronize_session=False)

    # 6. Follows
    db.query(Follow).filter(or_(Follow.follower_id == uid, Follow.following_id == uid)).delete(synchronize_session=False)

    # 7. Notifications
    db.query(Notification).filter(Notification.user_id == uid).delete(synchronize_session=False)

    # 8. Community Memberships
    db.query(CommunityMember).filter(CommunityMember.user_id == uid).delete(synchronize_session=False)

    # 9. Community Messages
    db.query(CommunityMessage).filter(CommunityMessage.sender_id == uid).delete(synchronize_session=False)

    # 10. Communities created by user - set created_by to None
    db.query(Community).filter(Community.created_by == uid).update({"created_by": None})

    # 11. Finally, the user
    db.delete(current_user)
    db.commit()

    return {"message": "Account deleted successfully"}