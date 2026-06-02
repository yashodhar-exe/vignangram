from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends
from app.core.config import BASE_URL
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.post import Post

from app.utils.storage import upload_file_to_supabase

router = APIRouter(
    prefix="/posts",
    tags=["Posts Upload"]
)


@router.post("/upload/{user_id}")
def upload_post(
    user_id: int,
    caption: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    image_url = upload_file_to_supabase(file, "posts")

    post = Post(

        user_id=user_id,

        caption=caption,

       image_url=image_url

    )

    db.add(post)

    db.commit()

    db.refresh(post)

    return {
        "message":
        "Post uploaded successfully",
        "post": post.id
    }