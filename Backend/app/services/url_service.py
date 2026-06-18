"""
app/services/url_service.py
────────────────────────────
Business logic for URL management.

Implements all CRUD operations + redirect tracking.
All operations are scoped to the authenticated user (user_id check).

New endpoints implemented:
  - get_user_urls       (was returning ALL users' URLs — security fix)
  - get_url_by_id       (new)
  - update_url          (new)
  - delete_url          (new)
  - bulk_delete_urls    (new)
  - get_redirect_url    (fixed: uses Depends(get_db), no session leak)
  - track_click         (was inline in main.py)
"""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.url import URL
from app.models.user import User
from app.schemas.url import URLCreate, URLUpdate
from app.utils.short_code import generate_short_code


def create_url(url_data: URLCreate, user: User, db: Session) -> URL:
    """
    Create a short URL for the authenticated user.
    Supports optional custom slug; generates a secure random code otherwise.
    """
    original_url_str = str(url_data.original_url)

    if url_data.custom_slug:
        # Validate custom slug uniqueness
        existing = db.query(URL).filter(URL.short_code == url_data.custom_slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"The slug '{url_data.custom_slug}' is already taken. Please choose another.",
            )
        short_code = url_data.custom_slug
    else:
        short_code = generate_short_code(db)

    new_url = URL(
        original_url=original_url_str,
        short_code=short_code,
        title=url_data.title,
        user_id=user.id,   # ← FIXED: was hardcoded to user_id=1
    )
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    return new_url


def get_user_urls(
    user_id: int,
    db: Session,
    skip: int = 0,
    limit: int = 50,
) -> list[URL]:
    """Return paginated URLs belonging to a specific user only."""
    return (
        db.query(URL)
        .filter(URL.user_id == user_id)      # ← FIXED: scoped to user
        .order_by(URL.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_url_count(user_id: int, db: Session) -> int:
    """Return total count of URLs for a user (for pagination metadata)."""
    return db.query(URL).filter(URL.user_id == user_id).count()


def get_url_by_id(url_id: int, user_id: int, db: Session) -> URL:
    """Fetch a URL, verifying ownership. Raises 404 if not found or not owned."""
    url = (
        db.query(URL)
        .filter(URL.id == url_id, URL.user_id == user_id)
        .first()
    )
    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found.",
        )
    return url


def update_url(url_id: int, url_data: URLUpdate, user_id: int, db: Session) -> URL:
    """Update mutable fields of a URL. Only modifies fields that are provided."""
    url = get_url_by_id(url_id, user_id, db)

    if url_data.original_url is not None:
        url.original_url = str(url_data.original_url)
    if url_data.title is not None:
        url.title = url_data.title
    if url_data.is_active is not None:
        url.is_active = url_data.is_active

    db.commit()
    db.refresh(url)
    return url


def delete_url(url_id: int, user_id: int, db: Session) -> None:
    """Delete a URL owned by the authenticated user."""
    url = get_url_by_id(url_id, user_id, db)
    db.delete(url)
    db.commit()


def bulk_delete_urls(ids: list[int], user_id: int, db: Session) -> int:
    """
    Delete multiple URLs at once. Only deletes URLs owned by user_id.
    Returns the count of actually deleted rows.
    """
    deleted_count = (
        db.query(URL)
        .filter(URL.id.in_(ids), URL.user_id == user_id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return deleted_count


def get_redirect_url(short_code: str, db: Session) -> URL:
    """
    Lookup a URL by short_code for redirection.
    Only returns active URLs. Raises 404 if not found or paused.

    FIXED: was in main.py with a manually opened session that was
    never closed on exception (connection leak).
    """
    url = (
        db.query(URL)
        .filter(URL.short_code == short_code, URL.is_active == True)  # noqa: E712
        .first()
    )
    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Short URL '{short_code}' not found or has been deactivated.",
        )
    return url


def track_click(url: URL, db: Session) -> None:
    """Increment the click counter for a URL."""
    url.clicks += 1
    db.commit()
