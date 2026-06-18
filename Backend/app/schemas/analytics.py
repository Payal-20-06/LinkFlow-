"""
app/schemas/analytics.py
────────────────────────
Pydantic schemas for analytics responses.
"""
from __future__ import annotations

from typing import List

from pydantic import BaseModel


class TopURL(BaseModel):
    id: int
    short: str
    destination: str
    short_code: str
    clicks: int
    ctr: str = "0%"
    trend: str = "+0%"


class DashboardStats(BaseModel):
    total_links: int
    total_clicks: int
    active_links: int
    avg_ctr: float
    top_urls: List[TopURL] = []


class URLAnalytics(BaseModel):
    id: int
    short_code: str
    original_url: str
    clicks: int
