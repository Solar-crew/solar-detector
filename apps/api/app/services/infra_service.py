from app.schemas.site_score import FeatureScore

def compute_road_access_score(
    lat: float,
    lon: float,
    weight: float,
) -> FeatureScore:
    # TODO: query road data (OSM / some API) and compute nearest road distance
    distance_m = 800  # placeholder

    # Example normalization: 0–200m = 1.0, >2000m = 0.0
    if distance_m <= 200:
        normalized = 1.0
    elif distance_m >= 2000:
        normalized = 0.0
    else:
        normalized = 1.0 - (distance_m - 200) / 1800.0

    contribution = normalized * weight

    return FeatureScore(
        raw_value=distance_m,
        normalized=normalized,
        weight=weight,
        contribution=contribution,
    )

def compute_grid_access_score(
    lat: float,
    lon: float,
    weight: float,
) -> FeatureScore:
    # TODO: query gridline data, compute nearest line / substation
    distance_m = 3000  # placeholder

    # normalization example similar to roads, but maybe stricter
    if distance_m <= 500:
        normalized = 1.0
    elif distance_m >= 5000:
        normalized = 0.0
    else:
        normalized = 1.0 - (distance_m - 500) / 4500.0

    contribution = normalized * weight

    return FeatureScore(
        raw_value=distance_m,
        normalized=normalized,
        weight=weight,
        contribution=contribution,
    )
