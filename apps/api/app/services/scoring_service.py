from datetime import date
from app.schemas.site_score import (
    SiteScoreRequest,
    SiteScoreResponse,
)
from app.services.cloud_service import compute_cloud_score
from app.services.elevation_service import compute_elevation_score
from app.services.infra_service import (
    compute_road_access_score,
    compute_grid_access_score,
)
from app.core.config import settings

def compute_site_score(request: SiteScoreRequest) -> SiteScoreResponse:
    loc = request.location
    tr = request.time_range

    # weights can come from settings (env vars / config)
    w_cloud = settings.W_CLOUD
    w_elev = settings.W_ELEVATION
    w_road = settings.W_ROAD
    w_grid = settings.W_GRID

    cloud = compute_cloud_score(
        lat=loc.lat,
        lon=loc.lon,
        radius_m=loc.radius_m,
        start_date=tr.start_date,
        end_date=tr.end_date,
        weight=w_cloud,
    )

    elevation = compute_elevation_score(
        lat=loc.lat,
        lon=loc.lon,
        radius_m=loc.radius_m,
        weight=w_elev,
    )

    road = compute_road_access_score(
        lat=loc.lat,
        lon=loc.lon,
        weight=w_road,
    )

    grid = compute_grid_access_score(
        lat=loc.lat,
        lon=loc.lon,
        weight=w_grid,
    )

    final_score = (
        cloud.contribution
        + elevation.contribution
        + road.contribution
        + grid.contribution
    )

    return SiteScoreResponse(
        final_score=final_score,
        cloud=cloud,
        elevation=elevation,
        road_access=road,
        grid_access=grid,
    )
