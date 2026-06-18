"""
app/utils/short_code.py
───────────────────────
Cryptographically secure short code generation with collision prevention.

Fixes vs original utils.py:
  - Uses secrets.choice() instead of random.choice()
    (random is predictable — an attacker can brute-force all codes
     if they know the seed; secrets is CSPRNG)
  - Checks DB for collision before returning
  - Retries up to max_attempts times
  - Escalates to longer codes if the space is saturated
"""
from __future__ import annotations

import secrets
import string

from sqlalchemy.orm import Session

_ALPHABET = string.ascii_letters + string.digits  # 62 chars → 62^6 = 56B combinations


def generate_short_code(
    db: Session,
    length: int = 6,
    max_attempts: int = 10,
) -> str:
    """
    Generate a unique, cryptographically secure short code.

    Algorithm:
      1. Pick `length` characters from _ALPHABET using secrets.choice()
      2. Query DB to check for collision
      3. Return code if unique, else retry up to max_attempts times
      4. If space appears saturated, recurse with length + 2
    """
    # Lazy import avoids circular dependency at module load time
    from app.models.url import URL

    for _ in range(max_attempts):
        code = "".join(secrets.choice(_ALPHABET) for _ in range(length))
        exists = db.query(URL.id).filter(URL.short_code == code).first()
        if not exists:
            return code

    # Space saturated at this length — try longer codes
    return generate_short_code(db, length=length + 2, max_attempts=max_attempts)
