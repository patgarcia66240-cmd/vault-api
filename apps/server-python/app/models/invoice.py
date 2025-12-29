from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class InvoiceStatus(str, enum.Enum):
    PAID = "paid"
    OPEN = "open"
    VOID = "void"
    DRAFT = "draft"
    UNCOLLECTIBLE = "uncollectible"


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    stripe_invoice_id = Column(String, unique=True, nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String, default="usd", nullable=False)
    status = Column(SQLEnum(InvoiceStatus), nullable=False)
    invoice_pdf = Column(String, nullable=True)  # URL to Stripe PDF
    hosted_invoice_url = Column(String, nullable=True)  # Payment page URL
    description = Column(Text, nullable=True)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user_profile = relationship("UserProfile", back_populates="invoices")

    def __repr__(self):
        return f"<Invoice {self.stripe_invoice_id}>"
