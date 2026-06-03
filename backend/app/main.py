from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import (Base,engine)

from app.api.auth import router as auth_router
from app.api.posts import router as post_router
from app.api.upload import router as upload_router
from app.api.users import router as user_router
from app.api.follows import router as follow_router
from app.api.notifications import (
    router as notification_router
)
from app.api.messages import router as message_router
from app.api.communities import router as communities_router
from app.api.gallery import router as gallery_router

from app.api.password import (
    router as password_router
)

from app.models.user import User
from app.models.otp import OTP
from app.models.follow import Follow
from app.models.post import Post
from app.models.comment import Comment
from app.models.like import Like
from app.models.notification import Notification
from app.models.message import Message
from app.models.gallery import GalleryFolder, GalleryPhoto

from app.api.likes import (router as like_router)

from app.api.comments import (router as comment_router)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VignanGram API"
)

import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(follow_router)
app.include_router(post_router)
app.include_router(upload_router)
app.include_router(notification_router)
app.include_router(like_router)
app.include_router(comment_router)
app.include_router(message_router)
app.include_router(communities_router)
app.include_router(gallery_router)


app.include_router(
    password_router
)

@app.get("/")
def home():

    return {
        "message":
        "Welcome to VignanGram"
    }