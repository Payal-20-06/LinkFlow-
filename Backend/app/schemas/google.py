"""
app/schemas/google.py
─────────────────────
Pydantic schema for Google OAuth login request.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class GoogleLoginRequest(BaseModel):
    """Request body for POST /api/v1/auth/google."""
    id_token: str = Field(..., min_length=1, description="Google ID token from GSI client.")
