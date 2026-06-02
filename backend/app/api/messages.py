from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from app.utils.storage import upload_file_to_supabase
import os
import shutil
from app.core.config import BASE_URL

from app.database.database import get_db
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
from app.core.security import get_current_user

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

@router.get("/contacts")
def get_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # For MVP, return all users except the current user 
    # so they can start a conversation with anyone.
    # We could restrict to only users they follow or who follow them.
    users = db.query(User).filter(User.id != current_user.id).all()
    
    contacts = []
    for user in users:
        # get last message
        last_message = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == user.id),
                and_(Message.sender_id == user.id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.desc()).first()

        unread_count = db.query(Message).filter(
            Message.sender_id == user.id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()

        contacts.append({
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "profile_picture": user.profile_picture,
            "last_message": last_message.content if last_message else "Start a conversation",
            "last_message_time": last_message.created_at if last_message else None,
            "unread_count": unread_count
        })
    
    # Sort by last_message_time if needed, but it's fine for now
    contacts.sort(key=lambda x: x["last_message_time"].timestamp() if x["last_message_time"] else 0, reverse=True)
    return contacts


@router.get("/{other_user_id}")
def get_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mark unread messages as read
    db.query(Message).filter(
        Message.sender_id == other_user_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    return messages


@router.post("/{receiver_id}")
def send_message(
    receiver_id: int,
    request: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")

    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=request.content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

@router.post("/{receiver_id}/image")
def send_image(
    receiver_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    receiver = db.query(User).filter(User.id == receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")

    image_url = upload_file_to_supabase(file, "messages")

    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=None,
        image_url=image_url
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

@router.get("/unread/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).count()
    return {"unread_count": count}
