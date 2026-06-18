"""
app/schemas/user.py
───────────────────
Pydantic v2 schemas for User-related request/response validation.

Key fixes vs original schemas.py:
  - Field length constraints (min_length, max_length)
  - Password strength validation
  - UserResponse omits hashed_password entirely
  - Token response includes full user object (fixes AuthContext crash)
  - UserInToken is the lightweight shape stored in localStorage
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Request schemas ───────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, examples=["Ada Lovelace"])
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    company: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ── Response schemas ──────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Full user profile — returned on GET /user/profile."""
    id: int
    name: str
    email: str
    plan: str
    company: Optional[str] = None
    website: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserInToken(BaseModel):
    """
    Lightweight user object embedded in the Token response.
    This is what AuthContext stores in localStorage as 'pf_user'.
    Fields match exactly what the frontend reads:
      user.id, user.name, user.email, user.plan, user.avatar
    """
    id: int
    name: str
    email: str
    plan: str
    avatar: Optional[str] = None


class Token(BaseModel):
    """
    Authentication response — fixes the original bug where
    the backend returned no 'user' object, causing AuthContext to
    store 'undefined' in localStorage and crash on next load.
    """
    access_token: str
    token_type: str = "bearer"
    user: UserInToken


class TokenData(BaseModel):
    email: Optional[str] = None
