"""
app/routes/users.py
───────────────────
User profile endpoints.

All endpoints live under the /api/v1/user prefix (set in main.py).
All endpoints require authentication.

Endpoints:
  GET /api/v1/user/profile    — get current user's profile
  PUT /api/v1/user/profile    — update current user's profile

NEW — these endpoints were completely missing from the original backend.
The React ProfilePage called GET /user/profile and PUT /user/profile
and always failed silently (the frontend used localStorage fallback).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()


@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Get current user profile",
)
def get_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Return the authenticated user's profile data.
    No DB query needed — user is already loaded by get_current_user.
    """
    return current_user


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user profile",
)
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Update mutable profile fields. Only provided fields are changed.
    Returns the full updated user object.
    """
    if user_data.name is not None:
        current_user.name = user_data.name.strip()
    if user_data.company is not None:
        current_user.company = user_data.company
    if user_data.website is not None:
        current_user.website = user_data.website
    if user_data.bio is not None:
        current_user.bio = user_data.bio

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
