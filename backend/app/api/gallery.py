from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.gallery import GalleryFolder, GalleryPhoto
from app.schemas.gallery import GalleryFolderResponse, GalleryPhotoResponse
from app.utils.storage import upload_file_to_supabase

router = APIRouter(prefix="/gallery", tags=["Gallery"])

@router.get("/folders", response_model=List[GalleryFolderResponse])
def get_gallery_folders(db: Session = Depends(get_db)):
    folders = db.query(GalleryFolder).order_by(GalleryFolder.created_at.desc()).all()
    return folders

@router.post("/folders", response_model=GalleryFolderResponse)
def create_gallery_folder(
    title: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cover_image_url = None
    if file:
        cover_image_url = upload_file_to_supabase(file, "gallery")
    
    new_folder = GalleryFolder(
        title=title,
        cover_image_url=cover_image_url,
        user_id=current_user.id
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder

@router.get("/folders/{folder_id}/photos", response_model=List[GalleryPhotoResponse])
def get_gallery_photos(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(GalleryFolder).filter(GalleryFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    photos = db.query(GalleryPhoto).filter(GalleryPhoto.folder_id == folder_id).order_by(GalleryPhoto.uploaded_at.desc()).all()
    return photos

@router.post("/folders/{folder_id}/photos", response_model=GalleryPhotoResponse)
def upload_gallery_photo(
    folder_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    folder = db.query(GalleryFolder).filter(GalleryFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
        
    image_url = upload_file_to_supabase(file, "gallery")
    
    new_photo = GalleryPhoto(
        folder_id=folder_id,
        image_url=image_url,
        user_id=current_user.id
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)
    return new_photo

@router.get("/folders/{folder_id}", response_model=GalleryFolderResponse)
def get_folder_details(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(GalleryFolder).filter(GalleryFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder
