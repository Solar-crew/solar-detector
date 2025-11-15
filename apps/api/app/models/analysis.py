from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func

from app.core.database import Base


class Analysis(Base):
    """Solar panel suitability analysis model"""

    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Analysis results
    suitability_score = Column(Float, nullable=True)  # 0-100 score
    annual_sunlight_hours = Column(Float, nullable=True)
    roof_area = Column(Float, nullable=True)  # in square meters
    estimated_capacity = Column(Float, nullable=True)  # in kW

    # Additional data
    extra_data = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Analysis {self.id}: {self.location_name} (Score: {self.suitability_score})>"
