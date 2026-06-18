"""
app/auth/hashing.py
───────────────────
Password hashing using the bcrypt library directly.

WHY: passlib[bcrypt]==1.7.4 (released 2020) is incompatible with
bcrypt 4.x+ because bcrypt removed the __about__ attribute.
This causes a ValueError at runtime on Python 3.12+ / bcrypt 4.x+.
Using bcrypt directly avoids the dependency on a stale wrapper.
"""
from __future__ import annotations

import bcrypt


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of plain_password."""
    return bcrypt.hashpw(
        plain_password.encode("utf-8"),
        bcrypt.gensalt(rounds=12),
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches hashed_password."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
