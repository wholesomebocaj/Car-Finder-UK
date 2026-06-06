from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CarListingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    make: str = Field(..., min_length=1, max_length=100)
    model: str = Field(..., min_length=1, max_length=100)
    registration_number: Optional[str] = Field(default=None, max_length=20)
    year: Optional[int] = Field(default=None, ge=1980, le=2030)
    price: int = Field(..., ge=0)
    mileage: Optional[int] = Field(default=None, ge=0)
    fuel_type: Optional[str] = None
    gearbox: Optional[str] = "Unknown"
    engine: Optional[str] = None
    trim: Optional[str] = None
    road_tax: Optional[int] = Field(default=None, ge=0)
    insurance_group: Optional[int] = Field(default=None, ge=1, le=50)
    service_history: str = "Unknown"
    mot_notes: Optional[str] = None
    listing_url: Optional[str] = None
    seller_type: str = "Unknown"
    comfort_score_manual: Optional[int] = Field(default=None, ge=1, le=10)
    reliability_score_manual: Optional[int] = Field(default=None, ge=1, le=10)
    gearbox_risk_manual: str = "Unknown"
    notes: Optional[str] = None


class CarListingCreate(CarListingBase):
    pass


class CarListingUpdate(CarListingBase):
    pass


class CarListingRead(CarListingBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScoredCarListing(CarListingRead):
    score: int
    verdict: str
    verdict_class: str
    score_breakdown: list[dict]
    warnings: list[str]
    hard_flags: list[str]
    matched_recommendations: list[dict]
    matched_avoid_rules: list[dict]
    comfort_estimate: Optional[int] = None
    reliability_estimate: Optional[int] = None
    main_risks: list[str]
