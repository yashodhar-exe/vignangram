from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GalleryFolderBase(BaseModel):
    title: str
    cover_image_url: Optional[str] = None

class GalleryFolderCreate(GalleryFolderBase):
    pass

class GalleryFolderResponse(GalleryFolderBase):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

class GalleryPhotoBase(BaseModel):
    image_url: str

class GalleryPhotoCreate(GalleryPhotoBase):
    pass

class GalleryPhotoResponse(GalleryPhotoBase):
    id: int
    folder_id: int
    uploaded_at: datetime
    user_id: int

    class Config:
        from_attributes = True
