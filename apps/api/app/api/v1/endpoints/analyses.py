from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisCreate, AnalysisResponse, AnalysisUpdate, CloudinessTestRequest, CloudinessStats
from app.services.cloud_service import compute_cloudiness_for_circle

router = APIRouter()


@router.post("/", response_model=AnalysisResponse, status_code=201)
def create_analysis(
    analysis_data: AnalysisCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new solar panel suitability analysis.

    This endpoint initiates an analysis for a specific location.
    The actual analysis computation can be done asynchronously.
    """
    analysis = Analysis(**analysis_data.model_dump())
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/", response_model=List[AnalysisResponse])
def list_analyses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of all analyses.

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    analyses = db.query(Analysis).offset(skip).limit(limit).all()
    return analyses


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve a specific analysis by ID.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.patch("/{analysis_id}", response_model=AnalysisResponse)
def update_analysis(
    analysis_id: int,
    analysis_update: AnalysisUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing analysis with computed results.

    This endpoint is typically called after the analysis computation is complete.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Update only provided fields
    update_data = analysis_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(analysis, field, value)

    db.commit()
    db.refresh(analysis)
    return analysis


@router.delete("/{analysis_id}", status_code=204)
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a specific analysis.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    db.delete(analysis)
    db.commit()
    return None

@router.post("/cloudiness-test", response_model=CloudinessStats)
def cloudiness_test(body: CloudinessTestRequest) -> CloudinessStats:
    return compute_cloudiness_for_circle(
        center_lat=body.center_lat,
        center_lon=body.center_lon,
        radius_m=body.radius_m,
        start_date=body.start_date,
        end_date=body.end_date,
    )
