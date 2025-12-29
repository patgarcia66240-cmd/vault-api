from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import crypto_manager
from app.models.user import UserProfile
from app.models.apikey import ApiKey
from app.schemas.apikey import ApiKeyCreate, ApiKeyResponse, ApiKeyDetailResponse, ApiKeysList
from app.routes.auth import get_current_user
import secrets
import hashlib
import json

router = APIRouter(prefix="/keys", tags=["apikeys"])


def generate_api_key() -> str:
    """Generate a random API key"""
    return f"vk_{secrets.token_urlsafe(32)}"


def get_api_key_parts(api_key: str) -> tuple[str, str]:
    """Get prefix and last4 from API key

    Pour les clés avec underscore:
    - sk_abc123def456 -> prefix: sk_, last4: d456
    - sk-proj_abc123def -> prefix: sk-proj_, last4: def...

    Pour les clés personnalisées (ex: Google, OpenAI):
    - On limite le prefix à 10 caractères max pour la contrainte DB
    """
    # Trouver le premier underscore pour séparer le préfixe
    first_underscore = api_key.find("_")

    if first_underscore > 0 and first_underscore < len(api_key) - 5:
        # Prendre tout jusqu'au premier underscore (inclus) comme prefix
        # Mais limiter à 10 caractères max pour la contrainte DB
        prefix = api_key[:first_underscore + 1]
        prefix = prefix[:10]  # Limiter à 10 caractères
        last4 = api_key[-4:]
    else:
        # Pas d'underscore ou clé trop courte, prendre les 8 premiers caractères
        # (pour laisser de la place aux *** dans l'affichage)
        prefix = api_key[:8]
        last4 = api_key[-4:] if len(api_key) >= 4 else api_key

    return prefix, last4


@router.post("", response_model=ApiKeyDetailResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    api_key_data: ApiKeyCreate,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new API key"""
    # Determine if we should use user's key or generate a new one
    # For SUPABASE, we generate our own key
    # For CUSTOM and AI providers (MISTRAL, DEEPSEEK, etc.), user provides the key
    if api_key_data.provider == "SUPABASE" or not api_key_data.value:
        # Generate API key
        api_key_plain = generate_api_key()
    else:
        # Use user-provided API key
        api_key_plain = api_key_data.value

    prefix, last4 = get_api_key_parts(api_key_plain)

    # Encrypt API key
    enc_ciphertext, enc_nonce = crypto_manager.encrypt(api_key_plain)

    # Create hash for lookup
    api_key_hash = hashlib.sha256(api_key_plain.encode()).hexdigest()

    # Handle provider config
    provider_config = None
    if api_key_data.provider == "SUPABASE" and api_key_data.provider_config:
        # If it's a dict, convert to JSON string
        if isinstance(api_key_data.provider_config, dict):
            provider_config = json.dumps(api_key_data.provider_config)
        # If it's already a string, validate JSON
        elif isinstance(api_key_data.provider_config, str):
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
        "id": str(new_api_key.id),
        "name": new_api_key.name,
        "provider": new_api_key.provider,
        "provider_config": new_api_key.provider_config,
        "prefix": new_api_key.prefix,
        "last4": new_api_key.last4,
        "revoked": new_api_key.revoked,
        "created_at": new_api_key.created_at.isoformat(),
        "updated_at": new_api_key.updated_at.isoformat(),
        "api_key": api_key_plain
    }


@router.get("", response_model=ApiKeysList)
def list_api_keys(
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all API keys for current user"""
    api_keys = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.revoked == False
    ).all()

    return {"apiKeys": api_keys}


@router.put("/{api_key_id}")
def update_api_key(
    api_key_id: str,
    api_key_data: ApiKeyCreate,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an API key (name, provider, or provider config)"""
    api_key = db.query(ApiKey).filter(
        ApiKey.id == api_key_id,
        ApiKey.user_id == current_user.id
    ).first()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    # Update name
    if api_key_data.name:
        api_key.name = api_key_data.name

    # Update provider if changed
    if api_key_data.provider and api_key_data.provider != api_key.provider:
        api_key.provider = api_key_data.provider

    # If value is provided (for CUSTOM or IA), update the encrypted key
    if api_key_data.value and api_key_data.provider in ["CUSTOM", "IA"]:
        # Generate new prefix and last4 from the provided key
        prefix, last4 = get_api_key_parts(api_key_data.value)

        # Encrypt the new key
        enc_ciphertext, enc_nonce = crypto_manager.encrypt(api_key_data.value)

        # Create new hash
        api_key_hash = hashlib.sha256(api_key_data.value.encode()).hexdigest()

        # Update the key
        api_key.enc_ciphertext = enc_ciphertext
        api_key.enc_nonce = enc_nonce
        api_key.hash = api_key_hash
        api_key.prefix = prefix
        api_key.last4 = last4

    # Handle provider config update (only for SUPABASE)
    provider_config = api_key.provider_config  # Keep existing by default
    if api_key_data.provider == "SUPABASE" and api_key_data.provider_config:
        if isinstance(api_key_data.provider_config, dict):
            provider_config = json.dumps(api_key_data.provider_config)
        elif isinstance(api_key_data.provider_config, str):
            try:
                json.loads(api_key_data.provider_config)
                provider_config = api_key_data.provider_config
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid provider_config JSON"
                )

    # Only update provider_config if it's being explicitly set for SUPABASE
    if api_key_data.provider == "SUPABASE":
        api_key.provider_config = provider_config
    elif api_key_data.provider in ["CUSTOM", "IA"]:
        # Clear provider_config for CUSTOM and IA
        api_key.provider_config = None

    db.commit()
    db.refresh(api_key)

    return {
        "id": str(api_key.id),
        "name": api_key.name,
        "provider": api_key.provider,
        "provider_config": api_key.provider_config,
        "prefix": api_key.prefix,
        "last4": api_key.last4,
        "revoked": api_key.revoked,
        "created_at": api_key.created_at.isoformat(),
        "updated_at": api_key.updated_at.isoformat()
    }


@router.get("/{api_key_id}/decrypt")
def reveal_api_key(
    api_key_id: str,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reveal the decrypted API key (one-time operation)"""
    api_key = db.query(ApiKey).filter(
        ApiKey.id == api_key_id,
        ApiKey.user_id == current_user.id
    ).first()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    # Decrypt the API key
    decrypted_key = crypto_manager.decrypt(api_key.enc_ciphertext, api_key.enc_nonce)

    return {
        "api_key": decrypted_key
    }


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(
    api_key_id: str,
    current_user: UserProfile = Depends(get_current_user),
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
