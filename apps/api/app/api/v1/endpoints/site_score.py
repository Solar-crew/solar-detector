from fastapi import APIRouter
from app.schemas.site_score import SiteScoreRequest, SiteScoreResponse
from app.services.scoring_service import compute_site_score

router = APIRouter()

@router.post("/site-score", response_model=SiteScoreResponse)
def get_site_score(request: SiteScoreRequest) -> SiteScoreResponse:
    return compute_site_score(request)
