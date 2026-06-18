from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import URLCreate
from app.models import URL
from app.database import get_db
from app.utils import generate_short_code

router = APIRouter()

@router.post("/create")
def create_url(
    url: URLCreate,
    db: Session = Depends(get_db)
):

    short_code = generate_short_code()

    new_url = URL(
        original_url=url.original_url,
        short_code=short_code,
        clicks=0,
        user_id=1
    )

    db.add(new_url)
    db.commit()
    db.refresh(new_url)

    return {
        "id": new_url.id,
        "original_url": new_url.original_url,
        "short_code": new_url.short_code,
        "short_url": f"http://localhost:8000/{new_url.short_code}"
    }
@router.get("/analytics/{url_id}")
def get_analytics(
    url_id: int,
    db: Session = Depends(get_db)
):
    url = db.query(URL).filter(
        URL.id == url_id
    ).first()

    if not url:
        return {"error": "URL not found"}

    return {
        "id": url.id,
        "original_url": url.original_url,
        "short_code": url.short_code,
        "clicks": url.clicks
    }
    
@router.get("/all")
def get_urls(db: Session = Depends(get_db)):
    return db.query(URL).all()