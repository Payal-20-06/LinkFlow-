"""
app/services/auth_service.py
────────────────────────────
Business logic for authentication (email/password + Google OAuth).

Supports two auth flows:
  1. Email/password — register_user() and authenticate_user()
  2. Google OAuth — google_login() verifies Google ID token, finds or creates user
"""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate


def register_user(user_data: UserCreate, db: Session) -> dict:
    """
    Create a new user account with email/password.
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
        auth_provider="local",
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

    # If user signed up with Google only and has no password, they can't use email/password login
    if user and user.auth_provider == "google" and not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google Sign-In. Please log in with Google.",
        )

    # Constant-time path: always run checkpw even if user is None
    # to prevent timing-based email enumeration.
    _DUMMY_HASH = "$2b$12$KIXlite.fakehashtoprevent.timing.xxxxxxxxxxxxxxxxxxxxxxxx"  # noqa
    stored_hash = user.hashed_password if (user and user.hashed_password) else _DUMMY_HASH

    if not verify_password(password, stored_hash) or user is None:
        raise _invalid

    token = create_access_token(data={"sub": user.email})
    return {"user": user, "token": token}


def google_login(id_token: str, db: Session) -> dict:
    """
    Authenticate a user via Google OAuth ID token.

    Flow:
      1. Verify the ID token with Google's servers
      2. Extract user info (email, name, picture, sub)
      3. Find existing user by google_id or email
      4. If existing local user → link Google account
      5. If no user → create new account
      6. Return { user, token }
    """
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token as google_id_token

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google Sign-In is not configured on this server.",
        )

    # Verify the ID token with Google
    try:
        payload = google_id_token.verify_oauth2_token(
            id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {e}",
        )

    # Extract user info from Google's payload
    google_sub = payload.get("sub")  # unique Google user ID
    email = payload.get("email", "").lower()
    name = payload.get("name", email.split("@")[0])
    picture = payload.get("picture")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not have an email address.",
        )

    # 1. Try to find by google_id first
    user = db.query(User).filter(User.google_id == google_sub).first()

    if not user:
        # 2. Try to find by email (user may have registered with email/password before)
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Link Google account to existing local user
            user.google_id = google_sub
            if not user.avatar and picture:
                user.avatar = picture
            db.commit()
            db.refresh(user)
        else:
            # 3. Create brand new Google user (no password needed)
            user = User(
                name=name,
                email=email,
                hashed_password=None,
                auth_provider="google",
                google_id=google_sub,
                avatar=picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    token = create_access_token(data={"sub": user.email})
    return {"user": user, "token": token}
