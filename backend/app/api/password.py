from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User
from app.models.otp import OTP

from app.schemas.password import (
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordRequest
)

from app.services.email import send_otp_email

from datetime import datetime
from datetime import timedelta

import random

router = APIRouter(
    prefix="/password",
    tags=["Password Reset"]
)


@router.post("/forgot")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    db.query(OTP).filter(
        OTP.email == request.email,
        OTP.purpose == "password_reset"
    ).delete()

    db.add(
        OTP(
            email=request.email,
            otp_code=otp,
            purpose="password_reset",
            expires_at=datetime.utcnow()
            + timedelta(minutes=5)
        )
    )

    db.commit()

    send_otp_email(
        request.email,
        otp
    )

    return {
        "message": "OTP sent"
    }


@router.post("/verify")
def verify_reset_otp(
    request: VerifyResetOTPRequest,
    db: Session = Depends(get_db)
):

    otp_record = db.query(OTP).filter(
        OTP.email == request.email,
        OTP.otp_code == request.otp,
        OTP.purpose == "password_reset"
    ).first()

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if otp_record.expires_at < datetime.utcnow():

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    return {
        "message": "OTP verified"
    }


@router.post("/reset")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    otp_record = db.query(OTP).filter(
        OTP.email == request.email,
        OTP.otp_code == request.otp,
        OTP.purpose == "password_reset"
    ).first()

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if otp_record.expires_at < datetime.utcnow():

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    from app.core.security import hash_password
    user.password = hash_password(request.new_password)

    db.commit()

    db.delete(otp_record)

    db.commit()

    return {
        "message": "Password updated"
    }