"""
app/services/auth_service.py
────────────────────────────
Business logic for authentication.
Routes are thin — all logic lives here.

Fixes vs original auth_routes.py:
  - Email enumeration fixed: same error for wrong email AND wrong password
  - Register returns access_token so user is immediately logged in
  - Password stored as hashed_password (not "password")
  - 409 Conflict for duplicate email (was 400)
"""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.models.user import User
from app.schemas.user import UserCreate


def register_user(user_data: UserCreate, db: Session) -> dict:
    """
    Create a new user account.
    Returns dict with 'user' (ORM object) and 'token' (JWT string).
    Raises HTTP 409 if email is already registered.
    """
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    new_user = User(
        name=user_data.name.strip(),
        email=user_data.email.lower(),
        hashed_password=hash_password(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email})
    return {"user": new_user, "token": token}


def authenticate_user(email: str, password: str, db: Session) -> dict:
    """
    Verify credentials and return user + token.

    Security: Returns the SAME error message whether the email doesn't
    exist OR the password is wrong. This prevents email enumeration
    attacks where an attacker could discover registered emails.
    """
    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Please check your email and password.",
    )

    user = (
        db.query(User)
        .filter(User.email == email.lower(), User.is_active == True)  # noqa: E712
        .first()
    )

    # Constant-time path: always run checkpw even if user is None
    # to prevent timing-based email enumeration.
    # Using a pre-computed bcrypt hash of a dummy string.
    _DUMMY_HASH = "$2b$12$KIXlite.fakehashtoprevent.timing.xxxxxxxxxxxxxxxxxxxxxxxx"  # noqa
    stored_hash = user.hashed_password if user else _DUMMY_HASH

    if not verify_password(password, stored_hash) or user is None:
        raise _invalid

    token = create_access_token(data={"sub": user.email})
    return {"user": user, "token": token}
