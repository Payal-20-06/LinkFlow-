"""
app/services/analytics_service.py
──────────────────────────────────
Business logic for analytics aggregation.

Note: Click-level analytics (device breakdown, geo, referrers) require
a separate click_events table. The current implementation provides
aggregate statistics from the URLs table. This is sufficient for
a v1 dashboard and is wired to real data (not mock).
"""
from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import Integer

from app.models.url import URL


def get_dashboard_stats(user_id: int, db: Session) -> dict:
    """
    Aggregate dashboard KPIs for a user.

    Returns:
      total_links   — total URLs created
      total_clicks  — sum of all click counters
      active_links  — URLs currently active
      avg_ctr       — average clicks per link (proxy for CTR)
      top_urls      — top 5 URLs by click count
    """
    from sqlalchemy import func

    # Aggregate total links, total clicks, and active links in one query
    stats = (
        db.query(
            func.count(URL.id).label("total_links"),
            func.sum(URL.clicks).label("total_clicks"),
            func.sum(func.cast(URL.is_active, Integer)).label("active_links")
        )
        .filter(URL.user_id == user_id)
        .first()
    )

    total_links = stats.total_links or 0
    total_clicks = stats.total_clicks or 0
    active_links = stats.active_links or 0
    avg_ctr = round(total_clicks / total_links, 2) if total_links > 0 else 0.0

    # Get top 5 URLs by clicks
    top_urls = (
        db.query(URL)
        .filter(URL.user_id == user_id)
        .order_by(URL.clicks.desc())
        .limit(5)
        .all()
    )

    return {
        "total_links": total_links,
        "total_clicks": total_clicks,
        "active_links": active_links,
        "avg_ctr": avg_ctr,
        "top_urls": top_urls,
    }


def get_url_analytics(url_id: int, user_id: int, db: Session) -> URL | None:
    """Return a single URL with its analytics for the owner."""
    return (
        db.query(URL)
        .filter(URL.id == url_id, URL.user_id == user_id)
        .first()
    )
