from datetime import datetime
from datetime import timedelta

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User
from app.models.otp import OTP
from app.models.community import Community, CommunityMember

from app.schemas.auth import (
    RegisterRequest,
    VerifyOTPRequest,
    CreateAccountRequest,
    LoginRequest
)

from app.services.otp import generate_otp

from app.services.email import send_otp_email

from app.core.security import (
    get_current_user,
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/check-username/{username}")
def check_username(
    username: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    return {
        "available":
        user is None
    }


@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    if not request.email.endswith(
        "@vignan.ac.in"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only Vignan emails allowed"
        )

    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    otp = generate_otp()

    db.query(OTP).filter(
        OTP.email == request.email
    ).delete()

    db.add(

        OTP(

            email=request.email,

            otp_code=otp,

            purpose="register",

            expires_at=
            datetime.utcnow()
            + timedelta(minutes=5)

        )

    )

    db.commit()

    try:
        send_otp_email(
            request.email,
            otp
        )
    except Exception as e:
        db.query(OTP).filter(OTP.email == request.email).delete()
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )

    return {
        "message":
        "OTP sent successfully"
    }


@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):

    otp_record = db.query(OTP).filter(

        OTP.email == request.email,

        OTP.otp_code == request.otp,

        OTP.is_used == False

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

    otp_record.is_used = True

    db.commit()

    return {
        "message":
        "OTP verified"
    }


@router.post("/create-account")
def create_account(
    request: CreateAccountRequest,
    db: Session = Depends(get_db)
):

    existing_email = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    existing_username = db.query(User).filter(
        User.username == request.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    user = User(

        name=request.name,

        username=request.username,

        roll_number=request.roll_number,

        email=request.email,

        password=
        hash_password(
            request.password
        ),

        branch=request.branch,

        academic_year=
        request.academic_year,

        section=request.section,

        dob=request.dob,

        gender=request.gender,

        is_verified=True

    )

    db.add(user)

    db.commit()
    db.refresh(user)

    current_year = datetime.utcnow().year
    try:
        start_year = current_year - int(request.academic_year) + 1
        end_year = start_year + 4
        batch_str = f"{start_year}-{str(end_year)[-2:]}"
    except ValueError:
        batch_str = "Unknown Batch"

    roman_map = {"1": "I", "2": "II", "3": "III", "4": "IV"}
    roman_year = roman_map.get(str(request.academic_year), request.academic_year)

    batch_community_name = f"{roman_year} Year {request.branch} {batch_str} Batch"
    section_community_name = f"{roman_year} year {request.branch} Section {request.section}"

    for c_name in [batch_community_name, section_community_name]:
        community = db.query(Community).filter(Community.name == c_name).first()
        if not community:
            community = Community(name=c_name, created_by=None)
            db.add(community)
            db.commit()
            db.refresh(community)

        member = CommunityMember(community_id=community.id, user_id=user.id)
        db.add(member)
    db.commit()

    return {
        "message":
        "Account created successfully"
    }


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        user = db.query(User).filter(
            User.username == request.email
        ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        request.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name
    }