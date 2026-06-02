from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app.utils.storage import upload_file_to_supabase

from app.core.config import BASE_URL

from app.database.database import get_db
from app.models.community import Community, CommunityMember, CommunityMessage
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(
    prefix="/communities",
    tags=["Communities"]
)

class CommunityCreate(BaseModel):
    name: str

class CommunityMessageCreate(BaseModel):
    content: str


@router.post("/")
def create_community(
    request: CommunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Community).filter(Community.name == request.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Community already exists")
    
    new_community = Community(name=request.name, created_by=current_user.id)
    db.add(new_community)
    db.commit()
    db.refresh(new_community)
    
    member = CommunityMember(community_id=new_community.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    
    return {"id": new_community.id, "name": new_community.name, "created_at": new_community.created_at}


@router.get("/me")
def get_my_communities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(CommunityMember).filter(CommunityMember.user_id == current_user.id).all()
    result = []
    for m in memberships:
        c = db.query(Community).filter(Community.id == m.community_id).first()
        if c:
            unread_count = db.query(CommunityMessage).filter(
                CommunityMessage.community_id == c.id,
                CommunityMessage.created_at > m.last_read_at,
                CommunityMessage.sender_id != current_user.id
            ).count()
            result.append({
                "id": c.id,
                "name": c.name,
                "created_at": c.created_at,
                "unread_count": unread_count
            })
    return result


@router.get("/{community_id}/messages")
def get_community_messages(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if member
    member = db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this community")
        
    messages = db.query(CommunityMessage).filter(CommunityMessage.community_id == community_id).order_by(CommunityMessage.created_at.asc()).all()
    
    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        result.append({
            "id": m.id,
            "content": m.content,
            "image_url": m.image_url,
            "created_at": m.created_at,
            "sender_id": m.sender_id,
            "sender_username": sender.username if sender else "Unknown"
        })
    return result

@router.post("/{community_id}/mark-read")
def mark_community_read(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this community")
        
    member.last_read_at = datetime.utcnow()
    db.commit()
    return {"message": "Community marked as read"}



@router.post("/{community_id}/messages")
def send_community_message(
    community_id: int,
    request: CommunityMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if member
    member = db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this community")
        
    new_message = CommunityMessage(
        community_id=community_id,
        sender_id=current_user.id,
        content=request.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {
        "id": new_message.id,
        "content": new_message.content,
        "image_url": new_message.image_url,
        "created_at": new_message.created_at,
        "sender_id": current_user.id,
        "sender_username": current_user.username
    }


@router.post("/{community_id}/messages/image")
def send_community_image(
    community_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if member
    member = db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this community")
        
    image_url = upload_file_to_supabase(file, "messages")
        
    new_message = CommunityMessage(
        community_id=community_id,
        sender_id=current_user.id,
        content=None,
        image_url=image_url
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {
        "id": new_message.id,
        "content": new_message.content,
        "image_url": new_message.image_url,
        "created_at": new_message.created_at,
        "sender_id": current_user.id,
        "sender_username": current_user.username
    }
