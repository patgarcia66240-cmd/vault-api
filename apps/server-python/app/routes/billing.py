from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserProfile
from app.routes.auth import get_current_user
from typing import List
from pydantic import BaseModel
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["billing"])


class Invoice(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    pdf_url: str | None = None


@router.get("/invoices", response_model=List[Invoice])
def get_invoices(
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des factures de l'utilisateur

    Pour l'instant, retourne une liste vide car Stripe n'est pas encore connecté.
    Cette endpoint sera implémenté complètement avec l'intégration Stripe.
    """
    # TODO: Implémenter la récupération des factures depuis Stripe
    # Pour l'instant, retourner une liste vide
    return []


@router.get("/subscription")
def get_subscription(
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les informations d'abonnement de l'utilisateur

    Pour l'instant, retourne None car Stripe n'est pas encore connecté.
    """
    # TODO: Implémenter la récupération de l'abonnement depuis Stripe
    return {
        "plan": None,
        "status": "none",
        "cancel_at_period_end": False
    }
