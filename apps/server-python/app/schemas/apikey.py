from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, Any
from app.models.apikey import ProviderType


class ApiKeyBase(BaseModel):
    name: str


class ApiKeyCreate(ApiKeyBase):
    provider: ProviderType = ProviderType.CUSTOM
    provider_config: Optional[Any] = None  # Accept any type, will be processed in route
    value: Optional[str] = None  # For custom API keys


class ApiKeyResponse(BaseModel):
    id: UUID
    name: str
    provider: ProviderType
    provider_config: Optional[str] = None
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


class ApiKeysList(BaseModel):
    apiKeys: list[ApiKeyResponse]
