from pydantic import BaseModel


class CreatePost(BaseModel):
    caption: str
    image_url: str | None = None


class CreateComment(BaseModel):
    text: str