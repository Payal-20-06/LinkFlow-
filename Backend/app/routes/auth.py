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

from datetime import timedelta
import pyotp
from fastapi import HTTPException

from app.auth.jwt import create_access_token, decode_access_token
from app.auth.hashing import hash_password, verify_password
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.google import GoogleLoginRequest
from app.schemas.user import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    Token,
    UserCreate,
    UserInToken,
    UserLogin,
    Setup2FAResponse,
    Verify2FARequest,
    Login2FARequest,
)
from app.services.auth_service import authenticate_user, google_login, register_user

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
    status_code=status.HTTP_200_OK,
    summary="Login to get access token",
)
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> dict:
    """
    Authenticate user. If 2FA is enabled, returns a temporary token.
    Otherwise, returns the final JWT access token.
    """
    result = authenticate_user(credentials.email, credentials.password, db)
    user: User = result["user"]
    if user.is_2fa_enabled:
        temp_token = create_access_token(
            data={"sub": str(user.id), "type": "2fa_temp"},
            expires_delta=timedelta(minutes=5)
        )
        return {"requires_2fa": True, "temp_token": temp_token}
    return _make_token_response(result).model_dump()


@router.post(
    "/google",
    response_model=Token,
    summary="Authenticate with Google OAuth",
)
def login_with_google(
    body: GoogleLoginRequest,
    db: Session = Depends(get_db),
) -> Token:
    """
    Verify a Google ID token and return a JWT + user object.
    Creates a new account if the Google user doesn't exist.
    Links Google to an existing account if the email matches.
    """
    result = google_login(body.id_token, db)
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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated successfully."}


# ── 2FA ───────────────────────────────────────────────────────────────────────

@router.post(
    "/2fa/setup",
    response_model=Setup2FAResponse,
    summary="Setup 2FA",
)
def setup_2fa(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    db.commit()
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email,
        issuer_name="LinkFlow"
    )
    return {"secret": secret, "provisioning_uri": uri}


@router.post(
    "/2fa/verify",
    summary="Verify and Enable 2FA",
)
def verify_2fa(body: Verify2FARequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not setup.")
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(body.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")
    
    current_user.is_2fa_enabled = True
    db.commit()
    return {"message": "2FA enabled successfully."}


@router.post(
    "/2fa/disable",
    summary="Disable 2FA",
)
def disable_2fa(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    current_user.is_2fa_enabled = False
    current_user.totp_secret = None
    db.commit()
    return {"message": "2FA disabled successfully."}


@router.post(
    "/login/2fa",
    summary="Complete 2FA login",
)
def login_2fa(body: Login2FARequest, db: Session = Depends(get_db)) -> dict:
    payload = decode_access_token(body.temp_token)
    if not payload or payload.get("type") != "2fa_temp":
        raise HTTPException(status_code=401, detail="Invalid temporary token.")
    
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user or not user.is_2fa_enabled or not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not configured.")
        
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(body.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan,
            "avatar": user.avatar,
            "is_2fa_enabled": user.is_2fa_enabled,
        },
    }
