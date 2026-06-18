"""
app/routes/auth.py
──────────────────
Authentication endpoints.

All endpoints live under the /api/v1/auth prefix (set in main.py).

Endpoints:
  POST /api/v1/auth/register       — create account + immediate login
  POST /api/v1/auth/login          — authenticate + get token
  POST /api/v1/auth/logout         — stateless (client discards token)
  POST /api/v1/auth/forgot-password — always 200 (prevents email enumeration)
  POST /api/v1/auth/change-password — requires authentication
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.hashing import hash_password, verify_password
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    Token,
    UserCreate,
    UserInToken,
    UserLogin,
)
from app.services.auth_service import authenticate_user, register_user

router = APIRouter()


def _make_token_response(result: dict) -> Token:
    """Convert service result to the Token schema the frontend expects."""
    user: User = result["user"]
    return Token(
        access_token=result["token"],
        token_type="bearer",
        user=UserInToken(
            id=user.id,
            name=user.name,
            email=user.email,
            plan=user.plan,
            avatar=user.avatar,
        ),
    )


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
)
def register(user_data: UserCreate, db: Session = Depends(get_db)) -> Token:
    """
    Create a new user account and immediately return an access token
    so the user is logged in without a separate login step.

    FIXED: original returned { message, id, name, email } with no token.
    Frontend AuthContext expected { access_token, user } — causing crash.
    """
    result = register_user(user_data, db)
    return _make_token_response(result)


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate and get access token",
)
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> Token:
    """
    Validate credentials and return JWT + user object.

    FIXED: original returned { access_token, token_type } with no user object.
    Frontend stored data.user → undefined → localStorage crash on reload.
    """
    result = authenticate_user(credentials.email, credentials.password, db)
    return _make_token_response(result)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout (stateless)",
)
def logout() -> dict:
    """
    Stateless logout — the client discards its token.
    NEW endpoint (was missing from original backend).
    For token blacklisting, add Redis integration here.
    """
    return {"message": "Logged out successfully."}


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    summary="Request password reset email",
)
def forgot_password(
    body: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> dict:
    """
    Always returns 200 regardless of whether the email exists.
    This prevents email enumeration (discovering registered accounts
    by watching which emails trigger an error vs. success).
    NEW endpoint (was missing from original backend).
    """
    # In production: look up user, generate reset token, send email
    # Here we always return the same success response for security
    return {
        "message": "If an account with that email exists, a reset link has been sent."
    }


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change password for authenticated user",
)
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Verify current password and update to new password.
    NEW endpoint (was missing from original backend).
    Requires valid JWT — uses get_current_user dependency.
    """
    from fastapi import HTTPException

    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
