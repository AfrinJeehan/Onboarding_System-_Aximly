from sqlalchemy import Column, DateTime, Integer, String, text
from sqlalchemy.sql import func

from app.core.database import Base


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    company_name = Column(String(150), nullable=True)
    business_type = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    onboarding_goal = Column(String(1000), nullable=True)
    status = Column(String(20), nullable=False, server_default=text("'pending'"))
    notification = Column(String(1000), nullable=True)
    notification_seen_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
