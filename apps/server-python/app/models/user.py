from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
import uuid
from app.core.database import Base
import enum


class PlanType(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"


class UserProfile(Base):
    """
    Profil utilisateur dans public.user_profiles
    Contient les données supplémentaires liées à auth.users de Supabase
    """
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)  # Référence auth.users.id
    plan = Column(SQLEnum(PlanType), default=PlanType.FREE, nullable=False)
    stripe_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    api_keys = relationship("ApiKey", back_populates="user_profile", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="user_profile", cascade="all, delete-orphan")

    @hybrid_property
    def email(self):
        # L'email est stocké dans auth.users, pas ici
        # Cette propriété sera utilisée quand on join avec auth.users
        return None

    def __repr__(self):
        return f"<UserProfile {self.id}>"


# Alias pour compatibilité avec le code existant
User = UserProfile
