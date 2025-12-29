from typing import Optional, Dict, Any
import os
import logging

try:
    import requests
except Exception:
    requests = None

from app.core.config import settings

logger = logging.getLogger(__name__)


def _headers():
    """Return headers for Supabase admin requests (service role)."""
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not key:
        return {}
    return {
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": "application/json",
    }


def admin_create_user(email: str, password: str, user_metadata: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Create a new user via Supabase Admin API. Requires SUPABASE_URL and SERVICE_KEY.

    Returns the user object on success or None on failure.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.debug("Supabase service key not configured; skipping admin_create_user")
        return None

    if requests is None:
        raise RuntimeError("`requests` package required for Supabase admin calls")

    url = settings.SUPABASE_URL.rstrip('/') + '/auth/v1/admin/users'
    payload = {
        "email": email,
        "password": password,
    }
    if user_metadata:
        payload["user_metadata"] = user_metadata

    resp = requests.post(url, json=payload, headers=_headers(), timeout=10)
    if resp.status_code not in (200, 201):
        logger.error("Supabase admin_create_user failed: %s %s", resp.status_code, resp.text)
        return None

    return resp.json()


def sign_in_with_password(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Sign in a user using Supabase auth (password grant). Returns token dict or None."""
    if not settings.SUPABASE_URL:
        return None
    if requests is None:
        raise RuntimeError("`requests` package required for Supabase auth calls")

    url = settings.SUPABASE_URL.rstrip('/') + '/auth/v1/token'
    data = {
        "grant_type": "password",
        "email": email,
        "password": password,
    }
    resp = requests.post(url, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    if resp.status_code != 200:
        logger.debug("Supabase sign_in failed: %s %s", resp.status_code, resp.text)
        return None
    return resp.json()


def get_user_from_token(access_token: str) -> Optional[Dict[str, Any]]:
    """Get Supabase user info from an access token."""
    if not settings.SUPABASE_URL:
        return None
    if requests is None:
        raise RuntimeError("`requests` package required for Supabase auth calls")

    url = settings.SUPABASE_URL.rstrip('/') + '/auth/v1/user'
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get(url, headers=headers, timeout=10)
    if resp.status_code != 200:
        logger.debug("Supabase get_user_from_token failed: %s %s", resp.status_code, resp.text)
        return None
    return resp.json()


def send_recovery_email(email: str) -> bool:
    """Trigger Supabase to send a recovery email to the user. Returns True if accepted."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.debug("Supabase service key not configured; skipping send_recovery_email")
        return False
    if requests is None:
        raise RuntimeError("`requests` package required for Supabase auth calls")

    url = settings.SUPABASE_URL.rstrip('/') + '/auth/v1/recover'
    payload = {"email": email}
    resp = requests.post(url, json=payload, headers=_headers(), timeout=10)
    return resp.status_code in (200, 204)


def admin_update_user_password(user_id: str, new_password: str) -> bool:
    """Update a user's password via Supabase Admin API."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.debug("Supabase service key not configured; skipping admin_update_user_password")
        return False
    if requests is None:
        raise RuntimeError("`requests` package required for Supabase auth calls")

    url = settings.SUPABASE_URL.rstrip('/') + f'/auth/v1/admin/users/{user_id}'
    payload = {"password": new_password}
    resp = requests.put(url, json=payload, headers=_headers(), timeout=10)
    if resp.status_code not in (200, 204):
        logger.error("Supabase admin_update_user_password failed: %s %s", resp.status_code, resp.text)
        return False
    return True


def admin_delete_user(user_id: str) -> bool:
    """Delete a user via Supabase Admin API."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.debug("Supabase service key not configured; skipping admin_delete_user")
        return False
    if requests is None:
        raise RuntimeError("`requests` package required for Supabase auth calls")

    url = settings.SUPABASE_URL.rstrip('/') + f'/auth/v1/admin/users/{user_id}'
    resp = requests.delete(url, headers=_headers(), timeout=10)
    if resp.status_code not in (200, 204):
        logger.error("Supabase admin_delete_user failed: %s %s", resp.status_code, resp.text)
        return False
    return True