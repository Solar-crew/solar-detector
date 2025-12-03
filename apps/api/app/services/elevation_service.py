from app.schemas.site_score import FeatureScore

def compute_elevation_score(
    lat: float,
    lon: float,
    radius_m: float,
    weight: float,
) -> FeatureScore:
    # TODO: call DEM API, compute slope/mean elevation here
    mean_slope_deg = 3.5  # placeholder

    # Example normalization: 0–5 degrees = excellent (1.0),
    # 20+ degrees = very bad (0.0)
    if mean_slope_deg <= 5:
        normalized = 1.0
    elif mean_slope_deg >= 20:
        normalized = 0.0
    else:
        normalized = 1.0 - (mean_slope_deg - 5) / 15.0

    contribution = normalized * weight

    return FeatureScore(
        raw_value=mean_slope_deg,
        normalized=normalized,
        weight=weight,
        contribution=contribution,
    )
