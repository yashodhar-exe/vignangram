from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.notification import Notification
from app.models.user import User
from app.core.security import get_current_user

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.notification import Notification

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/{user_id}")
def get_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(
        Notification
    ).filter(
        Notification.user_id == user_id
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return notifications


@router.get("/{user_id}/count")
def notification_count(
    user_id: int,
    db: Session = Depends(get_db)
):

    count = db.query(
        Notification
    ).filter(
        Notification.user_id == user_id
    ).count()

    return {
        "count": count
    }


@router.get("/unread/count")
def unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    count = db.query(
        Notification
    ).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {
        "count": count
    }

@router.post("/mark-read")
def mark_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "Notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id
    ).first()

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db.delete(notification)

    db.commit()

    return {
        "message": "Notification deleted"
    }


@router.delete("/user/{user_id}/clear")
def clear_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(
        Notification
    ).filter(
        Notification.user_id == user_id
    ).all()

    deleted = len(notifications)

    for notification in notifications:

        db.delete(notification)

    db.commit()

    return {
        "message": "Notifications cleared",
        "deleted": deleted
    }