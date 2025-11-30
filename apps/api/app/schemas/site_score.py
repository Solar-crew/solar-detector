from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class SiteLocation(BaseModel):
    lat: float
    lon: float
    # maybe radius or bbox size in meters
    radius_m: float = Field(500, description="Radius around point to analyze")

class TimeRange(BaseModel):
    start_date: date
    end_date: date

class FeatureScore(BaseModel):
    raw_value: float       # e.g. mean cloud fraction 0.42
    normalized: float      # mapped to 0–1
    weight: float          # e.g. 0.4
    contribution: float    # normalized * weight

class SiteScoreRequest(BaseModel):
    location: SiteLocation
    time_range: TimeRange

class SiteScoreResponse(BaseModel):
    final_score: float
    cloud: FeatureScore
    elevation: FeatureScore
    road_access: FeatureScore
    grid_access: FeatureScore
