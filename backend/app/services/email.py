import smtplib

from email.mime.text import MIMEText

from app.core.config import (
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM,
    MAIL_PORT,
    MAIL_SERVER
)


def send_otp_email(
    recipient: str,
    otp: str
):

    body = f"""
Welcome to VignanGram

Your OTP is:

{otp}

This OTP is valid for 5 minutes.

Do not share it with anyone.
"""

    message = MIMEText(body)

    message["Subject"] = (
        "VignanGram Verification OTP"
    )

    message["From"] = (
        MAIL_FROM
    )

    message["To"] = (
        recipient
    )

    try:

        server = smtplib.SMTP(
            MAIL_SERVER,
            MAIL_PORT
        )

        server.starttls()

        server.login(
            MAIL_USERNAME,
            MAIL_PASSWORD
        )

        server.send_message(
            message
        )

        server.quit()

        print(
            f"OTP sent to {recipient}"
        )

    except Exception as e:

        print(
            "EMAIL ERROR:",
            str(e)
        )

        raise e