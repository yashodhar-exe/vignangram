from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.database import get_db

from app.models.post import Post
from app.models.like import Like
from app.models.comment import Comment
from app.models.user import User

from app.schemas.post import (
    CreatePost,
    CreateComment
)

from app.core.security import (
    get_current_user
)

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)


@router.post("/")
def create_post(
    request: CreatePost,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    post = Post(
        user_id=user.id,
        caption=request.caption,
        image_url=request.image_url
    )

    db.add(post)

    db.commit()

    db.refresh(post)

    return post


@router.get("/")
def get_feed(
    db: Session = Depends(get_db)
):

    posts = db.query(Post).order_by(
        desc(Post.created_at)
    ).all()

    result = []

    for post in posts:

        user = db.query(User).filter(
            User.id == post.user_id
        ).first()

        likes = db.query(Like).filter(
            Like.post_id == post.id
        ).count()

        comments = db.query(Comment).filter(
            Comment.post_id == post.id
        ).count()

        result.append({
    "id": post.id,
    "user_id": post.user_id,
    "username": user.username if user else "Unknown",
    "profile_picture": user.profile_picture if user else None,
    "caption": post.caption,
    "image_url": post.image_url,
    "created_at": post.created_at,
    "likes": likes,
    "comments": comments
})

    return result


@router.post("/{post_id}/like/{user_id}")
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
            "message": "Already liked"
        }

    like = Like(
        user_id=user_id,
        post_id=post_id
    )

    db.add(like)

    db.commit()

    return {
        "message": "Post liked"
    }


@router.delete("/{post_id}/like/{user_id}")
def unlike_post(
    post_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == user_id
    ).first()

    if not like:

        return {
            "message": "Like not found"
        }

    db.delete(like)

    db.commit()

    return {
        "message": "Like removed"
    }


@router.post("/{post_id}/comment/{user_id}")
def comment_post(
    post_id: int,
    user_id: int,
    request: CreateComment,
    db: Session = Depends(get_db)
):

    comment = Comment(
        user_id=user_id,
        post_id=post_id,
        content=request.text
    )

    db.add(comment)

    db.commit()

    db.refresh(comment)

    return comment



@router.get("/{post_id}/comments")
def get_comments(
    post_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Comment).filter(
        Comment.post_id == post_id
    ).all()



@router.get("/search/{query}")
def search_posts(
    query: str,
    db: Session = Depends(get_db)
):

    return db.query(Post).filter(
        Post.caption.ilike(f"%{query}%")
    ).all()


@router.get("/latest")
def latest_posts(
    db: Session = Depends(get_db)
):

    return db.query(Post).order_by(
        desc(Post.created_at)
    ).all()


@router.get("/user/{user_id}")
def get_user_posts(
    user_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Post).filter(
        Post.user_id == user_id
    ).all()



@router.put("/{post_id}")
def update_post(
    post_id: int,
    caption: str,
    db: Session = Depends(get_db)
):

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if not post:

        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    post.caption = caption

    db.commit()

    db.refresh(post)

    return post


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db)
):

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if not post:

        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    db.delete(post)

    db.commit()

    return {
        "message": "Post deleted"
    }

@router.get("/{post_id}/liked/{user_id}")
def check_liked(
    post_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == user_id
    ).first()

    return {
        "liked": like is not None
    }