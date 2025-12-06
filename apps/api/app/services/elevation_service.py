from app.schemas.site_score import FeatureScore
from typing import Dict
import math

import io
import numpy as np
from PIL import Image

from app.services.sentinel_client import client as sentinel_client



#Acesta îi spune serviciului process să genereze o imagine cu un singur band = altitudinea în metri:

DEM_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: ["DEM"],
    output: {
      id: "default",
      bands: 1,
      sampleType: SampleType.FLOAT32
    }
  };
}

function evaluatePixel(sample) {
  // întoarcem înălțimea în metri
  return [sample.DEM];
}
"""
def compute_elevation_score(
    lat: float,
    lon: float,
    radius_m: float,
    weight: float,
) -> FeatureScore:
    """
    Calculează scorul de relief pentru un site:
      - ia patch DEM din Copernicus 30m via SentinelClient,
      - calculează gradientul cu NumPy,
      - derivă panta medie în grade,
      - o normalizează în [0, 1] și o ponderăm cu 'weight'.
    """

    mean_slope_deg = _compute_slope_from_dem(lat, lon, radius_m)

    # Normalizare simplă: <=5° => scor 1.0, >=20° => scor 0.0, între ele scade liniar
    if mean_slope_deg <= 5.0:
        normalized = 1.0
    elif mean_slope_deg >= 20.0:
        normalized = 0.0
    else:
        normalized = 1.0 - (mean_slope_deg - 5.0) / 15.0

    contribution = normalized * weight

    return FeatureScore(
        raw_value=mean_slope_deg,
        normalized=normalized,
        weight=weight,
        contribution=contribution,
        description="Average slope (deg) from Copernicus DEM via CDSE",
    )



def _build_dem_process_request(
    lat: float,
    lon: float,
    radius_m: float,
    size_px: int = 64,
) -> Dict:
    """
    Construiește payload-ul pentru Sentinel Hub Process API (DEM Copernicus 30m).
    Folosește un bbox mic în jurul punctului (lat, lon).
    """
    # aproximăm conversia metri -> grade
    dlat = radius_m / 111_320.0
    # pentru longitudine ținem cont de latitudine
    lat_rad = math.radians(lat)
    dlon = radius_m / (111_320.0 * max(math.cos(lat_rad), 1e-6))

    min_lon = lon - dlon
    max_lon = lon + dlon
    min_lat = lat - dlat
    max_lat = lat + dlat

    return {
        "input": {
            "bounds": {
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                },
                "bbox": [min_lon, min_lat, max_lon, max_lat],
            },
            "data": [
                {
                    "type": "dem",
                    "dataFilter": {
                        "demInstance": "COPERNICUS_30",
                    },
                    "processing": {
                        "upsampling": "BILINEAR",
                        "downsampling": "BILINEAR",
                    },
                }
            ],
        },
        "output": {
            "width": size_px,
            "height": size_px,
            "responses": [
                {
                    "identifier": "default",
                    "format": {"type": "image/tiff"},
                }
            ],
        },
        "evalscript": DEM_EVALSCRIPT,
    }


def _tiff_bytes_to_dem_array(raw_bytes: bytes) -> np.ndarray:
    """
    Transformă un GeoTIFF (bytes) într-o matrice 2D cu altitudini (metri).
    Folosește același pattern ca în cloud_service (PIL + NumPy).
    """
    img = Image.open(io.BytesIO(raw_bytes))
    arr = np.array(img, dtype=np.float32)

    # dacă din greșeală vin mai multe benzi, luăm prima
    if arr.ndim == 3:
        arr = arr[:, :, 0]

    # valori aberante (no-data) le punem NaN ca să le putem ignora
    arr[arr <= -10_000] = np.nan
    return arr

def _get_dem_patch(
    lat: float,
    lon: float,
    radius_m: float,
    size_px: int = 64,
) -> np.ndarray:
    """
    Folosește SentinelClient pentru a descărca un patch DEM în jurul punctului.
    Întoarce matricea 2D cu altitudini (metri).
    """
    payload = _build_dem_process_request(lat, lon, radius_m, size_px)

    # exact același tip de apel ca în cloud_service
    raw = sentinel_client.process_request(payload)

    dem = _tiff_bytes_to_dem_array(raw)

    return dem


def _compute_slope_from_dem(
    lat: float,
    lon: float,
    radius_m: float,
    size_px: int = 64,
) -> float:
    """
    Calculează panta medie (în grade) într-un patch DEM din jurul punctului.
    Folosește gradientul numeric (NumPy) al altitudinii.
    """
    dem = _get_dem_patch(lat, lon, radius_m, size_px)

    if np.isnan(dem).all():
        raise RuntimeError("DEM has no valid data in this area")

    # dimensiunea unui pixel aproximativ: acoperim [-radius_m, +radius_m] -> 2*radius_m
    cell_size_m = (2.0 * radius_m) / float(size_px)
    dx = dy = cell_size_m

    # gradient: primul array = derivata pe axa Y (rows), al doilea pe axa X (cols)
    dH_dy, dH_dx = np.gradient(dem, dy, dx)

    grad_mag = np.sqrt(dH_dx**2 + dH_dy**2)

    # ignorăm NaN înainte de media finală
    grad_mag = grad_mag[~np.isnan(grad_mag)]
    if grad_mag.size == 0:
        raise RuntimeError("DEM gradient had no valid pixels")

    slope_rad = np.arctan(grad_mag)
    slope_deg = np.degrees(slope_rad)

    mean_slope_deg = float(np.mean(slope_deg))
    return mean_slope_deg
