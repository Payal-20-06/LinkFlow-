"""
app/models/__init__.py
──────────────────────
Imports all models so SQLAlchemy's metadata is fully populated
before Base.metadata.create_all() is called.
"""
from app.models.user import User  # noqa: F401
from app.models.url import URL    # noqa: F401

__all__ = ["User", "URL"]
