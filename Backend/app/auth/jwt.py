"""
app/auth/jwt.py
───────────────
JWT creation and decoding.

Fixes vs original auth.py:
  - SECRET_KEY loaded from config (not hardcoded)
  - Uses datetime.now(timezone.utc) — datetime.utcnow() is deprecated
  - decode_access_token returns None on failure (caller decides to raise)
  - Properly typed
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from app.config import settings


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Encode a JWT with the given payload.
    Always sets an 'exp' claim using timezone-aware UTC.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT.
    Returns the payload dict on success, None on any failure.
    """
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        return None
