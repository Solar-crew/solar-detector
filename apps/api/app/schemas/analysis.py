from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class AnalysisBase(BaseModel):
    """Base schema for analysis"""

    location_name: str = Field(..., min_length=1, max_length=255)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class AnalysisCreate(AnalysisBase):
    """Schema for creating a new analysis"""

    pass


class AnalysisUpdate(BaseModel):
    """Schema for updating an analysis"""

    suitability_score: Optional[float] = Field(None, ge=0, le=100)
    annual_sunlight_hours: Optional[float] = Field(None, ge=0)
    roof_area: Optional[float] = Field(None, ge=0)
    estimated_capacity: Optional[float] = Field(None, ge=0)
    extra_data: Optional[dict] = None


class AnalysisResponse(AnalysisBase):
    """Schema for analysis response"""

    id: int
    suitability_score: Optional[float] = None
    annual_sunlight_hours: Optional[float] = None
    roof_area: Optional[float] = None
    estimated_capacity: Optional[float] = None
    extra_data: Optional[dict] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
