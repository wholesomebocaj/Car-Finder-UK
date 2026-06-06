from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from .database import Base


class CarListing(Base):
    __tablename__ = "car_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    registration_number = Column(String(20), nullable=True)
    year = Column(Integer, nullable=True)
    price = Column(Integer, nullable=False)
    mileage = Column(Integer, nullable=True)
    fuel_type = Column(String(50), nullable=True)
    gearbox = Column(String(50), nullable=True)
    engine = Column(String(100), nullable=True)
    trim = Column(String(100), nullable=True)
    road_tax = Column(Integer, nullable=True)
    insurance_group = Column(Integer, nullable=True)
    service_history = Column(String(50), default="Unknown", nullable=False)
    mot_notes = Column(Text, nullable=True)
    listing_url = Column(String(500), nullable=True)
    seller_type = Column(String(50), default="Unknown", nullable=False)
    comfort_score_manual = Column(Integer, nullable=True)
    reliability_score_manual = Column(Integer, nullable=True)
    gearbox_risk_manual = Column(String(50), default="Unknown", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
