from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True
