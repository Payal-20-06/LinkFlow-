"""
app/schemas/url.py
──────────────────
Pydantic v2 schemas for URL-related request/response validation.

Key fixes vs original schemas.py:
  - HttpUrl validates URL format (was plain str — no validation)
  - custom_slug with regex validation
  - URLResponse uses frontend-expected field names:
      "destination" (not "original_url")
      "short"       (not "short_code")
      "status"      (not "is_active")
      "created"     (ISO string)
  - BulkDeleteRequest for bulk operations
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


# ── Request schemas ───────────────────────────────────────────────────────────

class URLCreate(BaseModel):
    original_url: HttpUrl = Field(..., description="The long URL to shorten.")
    custom_slug: Optional[str] = Field(
        None,
        min_length=3,
        max_length=20,
        description="Optional custom short code (e.g. 'my-launch').",
        pattern=r"^[a-zA-Z0-9_-]+$",
    )
    title: Optional[str] = Field(None, max_length=255)


class URLUpdate(BaseModel):
    original_url: Optional[HttpUrl] = None
    title: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class BulkDeleteRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1)


# ── Response schemas ──────────────────────────────────────────────────────────

class URLResponse(BaseModel):
    """
    URL response shaped to exactly match the React frontend model.

    Frontend URLManagementPage and DashboardPage expect:
      { id, short, destination, short_code, title, clicks, status, tags, created }
    """
    id: int
    short: str               # full short URL: http://localhost:8000/abc123
    destination: str         # the original long URL
    short_code: str          # just the code: abc123
    title: Optional[str] = None
    clicks: int
    status: str              # "active" | "paused"
    tags: List[str] = []
    created: str             # ISO 8601 string — matches frontend date parsing


class PaginatedURLResponse(BaseModel):
    urls: List[URLResponse]
    total: int
    skip: int
    limit: int
