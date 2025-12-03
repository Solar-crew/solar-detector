from __future__ import annotations

import io
import math
from datetime import date
from typing import List, Tuple

import numpy as np
from shapely.geometry import box
from PIL import Image

from app.schemas.analysis import CloudinessStats
from app.services.sentinel_client import client


# --- Evalscripts (adapted from your Colab notebook) ---

EVALSCRIPT_CLOUD = """
//VERSION=3
function setup() {
  return {
    input: ["SCL", "dataMask"],
    output: { bands: 2, sampleType: "UINT8" }
  };
}

function evaluatePixel(sample) {
  // Sentinel-2 SCL cloud classes:
  // 3 = cloud_shadow, 8 = medium_cloud, 9 = high_cloud, 10 = cirrus
  let cloudClasses = [3, 8, 9, 10];
  let isCloud = cloudClasses.indexOf(sample.SCL) !== -1 ? 1 : 0;

  // band 0: dataMask (1 = valid pixel, 0 = nodata/outside tile)
  // band 1: cloud flag
  return [sample.dataMask, isCloud];
}
"""

EVALSCRIPT_RGB = """
//VERSION=3
function setup() {
  return {
    input: ["B04", "B03", "B02"],
    output: {
      bands: 3,
      sampleType: "AUTO"
    }
  };
}

function evaluatePixel(sample) {
  let r = sample.B04 * 2.5;
  let g = sample.B03 * 2.5;
  let b = sample.B02 * 2.5;

  r = Math.min(Math.max(r, 0), 1);
  g = Math.min(Math.max(g, 0), 1);
  b = Math.min(Math.max(b, 0), 1);

  return [r, g, b];
}
"""


# ---------- geometry helper: circle → bbox ---------- #

def circle_to_bbox(lat_deg: float, lon_deg: float, radius_m: float) -> Tuple[float, float, float, float]:
    """
    Approximate a circle on the Earth's surface with a bbox in EPSG:4326.
    Good enough for relatively small radii.
    Returns (min_lon, min_lat, max_lon, max_lat).
    """
    R = 6371000.0
    dlat = (radius_m / R) * (180.0 / math.pi)
    dlon = dlat / math.cos(math.radians(lat_deg))

    min_lat = lat_deg - dlat
    max_lat = lat_deg + dlat
    min_lon = lon_deg - dlon
    max_lon = lon_deg + dlon
    return min_lon, min_lat, max_lon, max_lat


# ---------- low-level helper: cloud fraction for a single date ---------- #

def _get_cloud_fraction_for_date(
    date_str: str,
    bbox: Tuple[float, float, float, float],
    width: int = 256,
    height: int = 256,
    min_valid_ratio: float = 0.8,
) -> Tuple[float | None, float]:
    """
    Returns (cloud_fraction, valid_ratio) for a given date and bbox.
    If valid_ratio < min_valid_ratio, returns (None, valid_ratio).

    This is the cleaned-up version of your per-date processing from the Colab script.
    """
    minx, miny, maxx, maxy = bbox

    payload = {
        "input": {
            "bounds": {
                "bbox": [minx, miny, maxx, maxy],
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/EPSG/0/4326"
                },
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{date_str}T00:00:00Z",
                            "to": f"{date_str}T23:59:59Z",
                        }
                    },
                }
            ],
        },
        "output": {
            "width": width,
            "height": height,
            "responses": [
                {"identifier": "default", "format": {"type": "image/png"}}
            ],
        },
        "evalscript": EVALSCRIPT_CLOUD,
    }

    raw = client.process_request(payload)
    img = Image.open(io.BytesIO(raw))
    arr = np.array(img)

    if arr.ndim != 3 or arr.shape[2] < 2:
        raise RuntimeError(f"Unexpected array shape: {arr.shape}")

    data_mask = arr[:, :, 0].astype(bool)
    cloud_mask = arr[:, :, 1].astype(np.float32)

    valid_ratio = float(data_mask.mean())
    if valid_ratio == 0:
        return None, valid_ratio
    if valid_ratio < min_valid_ratio:
        return None, valid_ratio

    cloud_fraction = float(cloud_mask[data_mask].mean())
    return cloud_fraction, valid_ratio


# ---------- main function: cloudiness for a circle & time range ---------- #

def compute_cloudiness_for_circle(
    center_lat: float,
    center_lon: float,
    radius_m: float,
    start_date: date,
    end_date: date,
    min_valid_ratio: float = 0.8,
    width: int = 256,
    height: int = 256,
    max_records: int = 50,
) -> CloudinessStats:
    """
    1. Builds a bbox from circle.
    2. Searches Sentinel-2 L2A products in the given date interval.
    3. For each product's acquisition day, computes cloud fraction.
    4. Filters scenes with low coverage (valid_ratio < min_valid_ratio).
    5. Returns CloudinessStats (mean, min, max, near-mean, etc.).
    """

    # 1. bbox
    min_lon, min_lat, max_lon, max_lat = circle_to_bbox(center_lat, center_lon, radius_m)
    aoi = box(min_lon, min_lat, max_lon, max_lat)

    # 2. catalogue search
    features = client.search_s2_products(
        geometry_wkt=aoi.wkt,
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat(),
        max_records=max_records,
    )

    if not features:
        raise RuntimeError("No Sentinel-2 products found for this area/time range")

    dates_filtered: List[str] = []
    cloud_fractions: List[float] = []
    valid_ratios: List[float] = []

    # 3. per-scene cloud fraction
    for p in features:
        # The catalogue uses 'startDate' ISO string, e.g. "2023-01-05T10:12:34.000Z"
        props = p.get("properties", {})
        start_iso = props.get("startDate") or props.get("startdate") or ""
        if len(start_iso) < 10:
            continue
        day = start_iso[:10]  # 'YYYY-MM-DD'

        cf, vr = _get_cloud_fraction_for_date(
            day,
            bbox=(min_lon, min_lat, max_lon, max_lat),
            width=width,
            height=height,
            min_valid_ratio=min_valid_ratio,
        )

        if cf is None:
            # scene skipped
            continue

        dates_filtered.append(day)
        cloud_fractions.append(cf)
        valid_ratios.append(vr)

    if not cloud_fractions:
        raise RuntimeError("All scenes were skipped due to low coverage")

    cloud_arr = np.array(cloud_fractions, dtype=np.float32)

    avg_cloudiness = float(cloud_arr.mean())
    clear_ratio = float((cloud_arr < 0.2).mean())

    i_min = int(cloud_arr.argmin())
    i_max = int(cloud_arr.argmax())
    i_mean = int(np.abs(cloud_arr - cloud_arr.mean()).argmin())

    return CloudinessStats(
        scenes_used=len(cloud_arr),
        dates=dates_filtered,
        cloud_fractions=[float(x) for x in cloud_fractions],
        valid_ratios=[float(x) for x in valid_ratios],
        mean_cloudiness=avg_cloudiness,
        clear_ratio=clear_ratio,
        least_cloudy_date=dates_filtered[i_min],
        least_cloudy_fraction=float(cloud_arr[i_min]),
        most_cloudy_date=dates_filtered[i_max],
        most_cloudy_fraction=float(cloud_arr[i_max]),
        near_mean_date=dates_filtered[i_mean],
        near_mean_fraction=float(cloud_arr[i_mean]),
    )
