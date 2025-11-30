from fastapi import APIRouter
from v1.endpoints import site_score

api_router = APIRouter()
api_router.include_router(site_score.router, prefix="/analyses", tags=["analyses"])
