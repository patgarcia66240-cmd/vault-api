from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, LargeBinary, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, BYTEA
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class ProviderType(str, enum.Enum):
    CUSTOM = "CUSTOM"
    SUPABASE = "SUPABASE"


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    provider = Column(SQLEnum(ProviderType), default=ProviderType.CUSTOM, nullable=False)
    provider_config = Column(Text, nullable=True)  # JSON string for Supabase config
    prefix = Column(String, nullable=False)
    last4 = Column(String, nullable=False)
    enc_ciphertext = Column(BYTEA, nullable=False)  # Encrypted API key
    enc_nonce = Column(BYTEA, nullable=False)  # Nonce for decryption
    hash = Column(String, unique=True, nullable=False, index=True)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="api_keys")

    def __repr__(self):
        return f"<ApiKey {self.prefix}***{self.last4}>"
