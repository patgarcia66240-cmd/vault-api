from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.models.user import PlanType


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    plan: PlanType
    stripe_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenWithUser(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
