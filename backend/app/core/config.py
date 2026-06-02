import os

from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        30
    )
)

MAIL_USERNAME = os.getenv(
    "MAIL_USERNAME"
)

MAIL_PASSWORD = os.getenv(
    "MAIL_PASSWORD"
)

MAIL_FROM = os.getenv(
    "MAIL_FROM"
)

MAIL_PORT = int(
    os.getenv(
        "MAIL_PORT",
        587
    )
)

MAIL_SERVER = os.getenv(
    "MAIL_SERVER"
)

BASE_URL = os.getenv(
    "BASE_URL"
)

SUPABASE_URL = os.getenv(
    "SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "SUPABASE_KEY"
)