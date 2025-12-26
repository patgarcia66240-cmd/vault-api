from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.models.apikey import ProviderType


class ApiKeyBase(BaseModel):
    name: str


class ApiKeyCreate(ApiKeyBase):
    provider: ProviderType = ProviderType.CUSTOM
    provider_config: Optional[str] = None


class ApiKeyResponse(BaseModel):
    id: UUID
    name: str
    provider: ProviderType
    prefix: str
    last4: str
    revoked: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApiKeyDetailResponse(ApiKeyResponse):
    api_key: str  # Only shown on creation


class ApiKeyReveal(BaseModel):
    api_key: str
