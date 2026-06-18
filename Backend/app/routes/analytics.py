"""
app/routes/analytics.py
───────────────────────
Analytics endpoints.

All endpoints live under the /api/v1/analytics prefix (set in main.py).
All endpoints require authentication.

Endpoints:
  GET /api/v1/analytics/dashboard     — KPIs for current user
  GET /api/v1/analytics/urls/{id}     — per-URL analytics

NOTE: Device breakdown, geo, referrer analytics require a click_events
table (a v2 feature). Those frontend service calls (getDeviceStats,
getGeoStats, getClickTrends) are handled gracefully in the frontend
by falling back to an empty/zero state rather than erroring.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import DashboardStats, TopURL, URLAnalytics
from app.services.analytics_service import get_dashboard_stats, get_url_analytics

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=DashboardStats,
    summary="Get dashboard statistics for current user",
)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardStats:
    """
    Returns real aggregated KPIs from the database:
      - total_links, total_clicks, active_links, avg_ctr, top_urls

    NEW endpoint — analytics_routes.py was completely empty in the original.
    The React DashboardPage was using 100% hardcoded mock data.
    """
    stats = get_dashboard_stats(current_user.id, db)
    return DashboardStats(
        total_links=stats["total_links"],
        total_clicks=stats["total_clicks"],
        active_links=stats["active_links"],
        avg_ctr=stats["avg_ctr"],
        top_urls=[
            TopURL(
                id=u.id,
                short=f"{settings.BASE_URL}/{u.short_code}",
                destination=u.original_url,
                short_code=u.short_code,
                clicks=u.clicks,
            )
            for u in stats["top_urls"]
        ],
    )


@router.get(
    "/urls/{url_id}",
    response_model=URLAnalytics,
    summary="Get analytics for a specific URL",
)
def url_analytics(
    url_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> URLAnalytics:
    """
    Return click analytics for a single URL owned by the current user.
    NEW endpoint — was missing from the original backend.
    """
    url = get_url_analytics(url_id, current_user.id, db)
    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found.",
        )
    return URLAnalytics(
        id=url.id,
        short_code=url.short_code,
        original_url=url.original_url,
        clicks=url.clicks,
    )
