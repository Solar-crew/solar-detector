from datetime import date

from app.services.cloud_service import compute_cloudiness_for_circle


def main():
    # Pick a small time range first so it’s faster
    center_lat = 46.77
    center_lon = 23.59
    radius_m = 1000  # 1 km radius

    stats = compute_cloudiness_for_circle(
        center_lat=center_lat,
        center_lon=center_lon,
        radius_m=radius_m,
        start_date=date(2022, 12, 1),
        end_date=date(2023, 1, 15),
        min_valid_ratio=0.8,
        width=128,
        height=128,
        max_records=10,
    )

    print("Scenes used:", stats.scenes_used)
    print("Mean cloudiness:", stats.mean_cloudiness)
    print("Clear ratio (< 0.2):", stats.clear_ratio)
    print("Least cloudy:", stats.least_cloudy_date, stats.least_cloudy_fraction)
    print("Most cloudy:", stats.most_cloudy_date, stats.most_cloudy_fraction)
    print("Near mean:", stats.near_mean_date, stats.near_mean_fraction)


if __name__ == "__main__":
    main()
