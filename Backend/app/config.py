"""
app/config.py
─────────────
Centralised settings loaded from environment variables / .env file.
All secrets live here — never hardcoded anywhere else.
"""
from __future__ import annotations

import json
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = "LinkFlow"
    DEBUG: bool = False

    # ── Security ──────────────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./linkflow.db"

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Stored in .env as a JSON array string: ["http://localhost:3000"]
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # ── Short links ───────────────────────────────────────────────────────────
    BASE_URL: str = "http://localhost:8000"

    # ── Google OAuth ──────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Allow CORS_ORIGINS to be a JSON string or a real list."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # Fallback: treat comma-separated string
                return [origin.strip() for origin in v.split(",")]
        return v


# Singleton — import this everywhere
settings = Settings()
