"""
app/routes/urls.py
──────────────────
URL management endpoints.

All endpoints live under the /api/v1/urls prefix (set in main.py).
ALL endpoints require authentication via get_current_user.
ALL operations are scoped to the authenticated user — no cross-user access.

Endpoints:
  GET    /api/v1/urls              — list user's URLs (paginated)
  POST   /api/v1/urls              — create short URL
  GET    /api/v1/urls/{id}         — get single URL
  PUT    /api/v1/urls/{id}         — update URL
  DELETE /api/v1/urls/{id}         — delete URL
  POST   /api/v1/urls/bulk-delete  — delete multiple URLs

Response shape matches what the React frontend expects:
  { id, short, destination, short_code, title, clicks, status, tags, created }
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.url import URL
from app.models.user import User
from app.schemas.url import BulkDeleteRequest, PaginatedURLResponse, URLCreate, URLResponse, URLUpdate
from app.services import url_service

router = APIRouter()


# ── Helper ────────────────────────────────────────────────────────────────────

def _to_response(url: URL) -> URLResponse:
    """
    Convert a URL ORM object into the URLResponse schema.
    Maps backend field names to the exact names the React frontend uses:
      original_url → destination
      short_code   → short (with full base URL)
      is_active    → status ("active" | "paused")
    """
    return URLResponse(
        id=url.id,
        short=f"{settings.BASE_URL}/{url.short_code}",
        destination=url.original_url,
        short_code=url.short_code,
        title=url.title,
        clicks=url.clicks,
        status="active" if url.is_active else "paused",
        tags=[],  # Tags support requires a separate join table — v2 roadmap
        created=url.created_at.isoformat(),
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=PaginatedURLResponse,
    summary="List authenticated user's URLs",
)
def list_urls(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedURLResponse:
    """
    Return paginated list of URLs owned by the authenticated user.

    FIXED: original GET /url/all returned ALL users' URLs to anyone
    with no authentication — a critical data exposure vulnerability.
    """
    urls = url_service.get_user_urls(current_user.id, db, skip=skip, limit=limit)
    total = url_service.get_url_count(current_user.id, db)
    return PaginatedURLResponse(
        urls=[_to_response(u) for u in urls],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post(
    "",
    response_model=URLResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new short URL",
)
def create_url(
    url_data: URLCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> URLResponse:
    """
    Shorten a URL. Optionally accepts a custom slug.

    FIXED: original hardcoded user_id=1 — every URL belonged to user 1
    regardless of who was logged in. Now uses real authenticated user.
    FIXED: original used random.choice() — now uses secrets.choice().
    FIXED: original had no collision retry — now retries up to 10 times.
    """
    url = url_service.create_url(url_data, current_user, db)
    return _to_response(url)


@router.get(
    "/{url_id}",
    response_model=URLResponse,
    summary="Get a single URL by ID",
)
def get_url(
    url_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> URLResponse:
    """
    Fetch a single URL by ID.
    Returns 404 if not found or not owned by the current user.
    NEW endpoint — was completely missing from the original backend.
    """
    url = url_service.get_url_by_id(url_id, current_user.id, db)
    return _to_response(url)


@router.put(
    "/{url_id}",
    response_model=URLResponse,
    summary="Update a URL",
)
def update_url(
    url_id: int,
    url_data: URLUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> URLResponse:
    """
    Update original URL, title, or active status.
    Only provided fields are updated (partial update / PATCH semantics).
    NEW endpoint — was completely missing from the original backend.
    """
    url = url_service.update_url(url_id, url_data, current_user.id, db)
    return _to_response(url)


@router.delete(
    "/{url_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    summary="Delete a URL",
)
def delete_url(
    url_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """
    Permanently delete a URL owned by the authenticated user.
    NEW endpoint — was completely missing from the original backend.
    Returns 204 No Content on success.
    """
    url_service.delete_url(url_id, current_user.id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/bulk-delete",
    status_code=status.HTTP_200_OK,
    summary="Delete multiple URLs at once",
)
def bulk_delete(
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Delete a list of URLs by ID in a single request.
    Only deletes URLs owned by the current user — silently skips others.
    NEW endpoint — was completely missing from the original backend.
    """
    deleted_count = url_service.bulk_delete_urls(request.ids, current_user.id, db)
    return {"deleted": deleted_count, "message": f"{deleted_count} link(s) deleted."}
