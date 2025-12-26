from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import crypto_manager
from app.models.user import User
from app.models.apikey import ApiKey
from app.schemas.apikey import ApiKeyCreate, ApiKeyResponse, ApiKeyDetailResponse
from app.routes.auth import get_current_user
import secrets
import hashlib
import json

router = APIRouter(prefix="/apikeys", tags=["apikeys"])


def generate_api_key() -> str:
    """Generate a random API key"""
    return f"vk_{secrets.token_urlsafe(32)}"


def get_api_key_parts(api_key: str) -> tuple[str, str]:
    """Get prefix and last4 from API key"""
    parts = api_key.split("_")
    if len(parts) > 1:
        prefix = parts[0] + "_"
        last4 = api_key[-4:]
    else:
        prefix = api_key[:4]
        last4 = api_key[-4:]
    return prefix, last4


@router.post("", response_model=ApiKeyDetailResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    api_key_data: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new API key"""
    # Generate API key
    api_key_plain = generate_api_key()
    prefix, last4 = get_api_key_parts(api_key_plain)

    # Encrypt API key
    enc_ciphertext, enc_nonce = crypto_manager.encrypt(api_key_plain)

    # Create hash for lookup
    api_key_hash = hashlib.sha256(api_key_plain.encode()).hexdigest()

    # Handle provider config
    provider_config = None
    if api_key_data.provider == "SUPABASE" and api_key_data.provider_config:
        # Validate JSON
        try:
            json.loads(api_key_data.provider_config)
            provider_config = api_key_data.provider_config
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid provider_config JSON"
            )

    # Create API key record
    new_api_key = ApiKey(
        user_id=current_user.id,
        name=api_key_data.name,
        provider=api_key_data.provider,
        provider_config=provider_config,
        prefix=prefix,
        last4=last4,
        enc_ciphertext=enc_ciphertext,
        enc_nonce=enc_nonce,
        hash=api_key_hash
    )

    db.add(new_api_key)
    db.commit()
    db.refresh(new_api_key)

    # Return with plain API key (only shown once)
    return {
        **ApiKeyDetailResponse.model_validate(new_api_key).model_dump(),
        "api_key": api_key_plain
    }


@router.get("", response_model=list[ApiKeyResponse])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all API keys for current user"""
    api_keys = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.revoked == False
    ).all()

    return api_keys


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(
    api_key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke an API key"""
    api_key = db.query(ApiKey).filter(
        ApiKey.id == api_key_id,
        ApiKey.user_id == current_user.id
    ).first()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    api_key.revoked = True
    db.commit()

    return None
