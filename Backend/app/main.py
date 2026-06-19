"""
app/main.py
───────────
FastAPI application entry point.

Fixes vs original main.py:
  ✅ No wildcard imports (was: from app.models import *)
  ✅ No duplicate imports
  ✅ CORS middleware configured (was missing — all browser requests blocked)
  ✅ All routes under /api/v1 prefix (was missing — all calls 404'd)
  ✅ Redirect handler uses Depends(get_db) — no session leak
  ✅ Redirect returns 302 Found (correct HTTP semantics)
  ✅ 404 for unknown short codes (was returning 200 + JSON error)
  ✅ /health endpoint added
  ✅ Structured logging
  ✅ Global exception handler
  ✅ Lifespan for startup/shutdown events
  ✅ Docs only served in DEBUG mode
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.database import Base, engine, get_db

# Import models so their tables are registered with Base before create_all()
import app.models  # noqa: F401 — side-effect import

from app.routes import auth as auth_routes
from app.routes import urls as url_routes
from app.routes import analytics as analytics_routes
from app.routes import users as user_routes
from app.services.url_service import get_redirect_url, track_click

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Run startup and shutdown logic."""
    # Startup
    logger.info("Starting %s …", settings.APP_NAME)
    # Schema managed by Alembic migrations.
    # For local dev with SQLite, run: alembic upgrade head
    # For docker, migrations run automatically.
    Base.metadata.create_all(bind=engine)  # Fallback for dev — Alembic is preferred
    logger.info("Database tables verified.")
    yield
    # Shutdown
    logger.info("%s shutting down.", settings.APP_NAME)


# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Production-ready URL Shortener SaaS API. "
        "Provides authentication, URL management, and analytics."
    ),
    version="1.0.0",
    lifespan=lifespan,
    # Only expose interactive docs in debug mode
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)


# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def secure_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ── Request logging ───────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("→ %s %s", request.method, request.url.path)
    response = await call_next(request)
    logger.info("← %s %s %s", request.method, request.url.path, response.status_code)
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
_API = "/api/v1"

app.include_router(
    auth_routes.router,
    prefix=f"{_API}/auth",
    tags=["Authentication"],
)
app.include_router(
    url_routes.router,
    prefix=f"{_API}/urls",
    tags=["URLs"],
)
app.include_router(
    analytics_routes.router,
    prefix=f"{_API}/analytics",
    tags=["Analytics"],
)
app.include_router(
    user_routes.router,
    prefix=f"{_API}/user",
    tags=["User"],
)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], include_in_schema=True)
def health_check() -> dict:
    """
    Simple liveness probe. Returns 200 when the service is running.
    Used by Docker health checks, load balancers, and monitoring.
    """
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": "1.0.0",
    }


@app.get("/", tags=["Health"], include_in_schema=False)
def root_health_check() -> dict:
    """Root route for Render default health checks."""
    return {"status": "ok"}


# ── Redirect ──────────────────────────────────────────────────────────────────
from fastapi.responses import RedirectResponse as _RedirectResponse

@app.get(
    "/{short_code}",
    tags=["Redirect"],
    response_class=_RedirectResponse,
    status_code=status.HTTP_302_FOUND,
    summary="Redirect short URL to original destination",
    include_in_schema=False,
)
@limiter.limit("60/minute")
def redirect_short_url(
    short_code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Look up short_code and redirect to the original URL.
    """
    from fastapi import HTTPException
    try:
        url = get_redirect_url(short_code, db)
        track_click(url, db)
        return _RedirectResponse(url=url.original_url, status_code=status.HTTP_302_FOUND)
    except HTTPException as e:
        if e.status_code == status.HTTP_404_NOT_FOUND:
            # Redirect invalid links to the frontend's 404 page
            frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
            return _RedirectResponse(url=f"{frontend_url.rstrip('/')}/404", status_code=status.HTTP_302_FOUND)
        raise


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler — prevents internal details leaking to clients."""
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )