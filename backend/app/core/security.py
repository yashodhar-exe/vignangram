from passlib.context import CryptContext

from jose import jwt
from jose import JWTError

from datetime import datetime
from datetime import timedelta

from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User

from fastapi.security import OAuth2PasswordBearer

from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {"exp": expire}
    )

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def verify_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = verify_token(token)

    email = payload.get("sub")

    if email is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user