from fastapi import APIRouter

from app.api.v1.endpoints import analyses

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(analyses.router, prefix="/analyses", tags=["analyses"])
