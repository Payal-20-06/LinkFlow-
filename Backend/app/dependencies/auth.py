"""
app/dependencies/auth.py
────────────────────────
The get_current_user FastAPI dependency.

This is the critical piece that was ENTIRELY MISSING from the original
codebase. JWT tokens were created on login but NEVER verified on any
protected route — all routes were publicly accessible without auth.

Usage:
    from app.dependencies.auth import get_current_user

    @router.get("/protected")
    def protected(current_user: User = Depends(get_current_user)):
        ...
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt import decode_access_token
from app.database import get_db
from app.models.user import User

# Points to the login endpoint so Swagger UI can auto-authenticate
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials. Please log in again.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the Bearer token, load the user from DB, and return it.
    Raises HTTP 401 if the token is missing, invalid, or expired,
    or if the user no longer exists or is inactive.
    """
    payload = decode_access_token(token)
    if payload is None:
        raise _CREDENTIALS_EXCEPTION

    email: str | None = payload.get("sub")
    if not email:
        raise _CREDENTIALS_EXCEPTION

    user = (
        db.query(User)
        .filter(User.email == email, User.is_active == True)  # noqa: E712
        .first()
    )
    if user is None:
        raise _CREDENTIALS_EXCEPTION

    return user
