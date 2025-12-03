from datetime import date, datetime
from typing import Optional, List

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


class CloudinessStats(BaseModel):
    scenes_used: int
    dates: List[str]
    cloud_fractions: List[float]
    valid_ratios: List[float]

    mean_cloudiness: float
    clear_ratio: float  # fraction of scenes with cf < 0.2

    least_cloudy_date: str
    least_cloudy_fraction: float

    most_cloudy_date: str
    most_cloudy_fraction: float

    near_mean_date: str
    near_mean_fraction: float

class CloudinessTestRequest(BaseModel):
    center_lat: float
    center_lon: float
    radius_m: float
    start_date: date
    end_date: date