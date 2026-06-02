from pydantic import BaseModel


class RegisterRequest(BaseModel):

    email: str


class VerifyOTPRequest(BaseModel):

    email: str
    otp: str


class CreateAccountRequest(BaseModel):

    name: str

    username: str

    roll_number: str

    email: str

    password: str

    branch: str

    academic_year: str

    section: str

    dob: str

    gender: str


class LoginRequest(BaseModel):

    email: str

    password: str