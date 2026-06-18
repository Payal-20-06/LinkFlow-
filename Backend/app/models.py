from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)

    original_url = Column(String)

    short_code = Column(
        String,
        unique=True,
        index=True
    )

    clicks = Column(Integer, default=0)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )