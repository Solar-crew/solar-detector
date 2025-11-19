import type { LatLng } from 'leaflet';

/**
 * Calculate the area of a circle in square kilometers
 * @param radius - Radius in meters
 * @returns Area in square kilometers
 */
export function calculateCircleArea(radius: number): number {
  const areaInSquareMeters = Math.PI * radius * radius;
  return areaInSquareMeters / 1_000_000; // Convert to km²
}

/**
 * Calculate the area of a rectangle in square kilometers
 * @param width - Width in meters
 * @param height - Height in meters
 * @returns Area in square kilometers
 */
export function calculateRectangleArea(width: number, height: number): number {
  const areaInSquareMeters = width * height;
  return areaInSquareMeters / 1_000_000; // Convert to km²
}

/**
 * Calculate the area of a hexagon in square kilometers
 * @param radius - Radius in meters
 * @returns Area in square kilometers
 */
export function calculateHexagonArea(radius: number): number {
  // Hexagon area = (3 * sqrt(3) / 2) * radius²
  const areaInSquareMeters = (3 * Math.sqrt(3) / 2) * radius * radius;
  return areaInSquareMeters / 1_000_000; // Convert to km²
}

/**
 * Calculate the area of a polygon using the Shoelace formula
 * Accounts for Earth's curvature using the Haversine formula
 * @param points - Array of LatLng points
 * @returns Area in square kilometers
 */
export function calculatePolygonArea(points: LatLng[]): number {
  if (points.length < 3) return 0;

  // Convert to radians
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  // Earth's radius in meters
  const R = 6371000;

  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    const lat1 = typeof p1 === 'object' && 'lat' in p1 ? p1.lat : 0;
    const lng1 = typeof p1 === 'object' && 'lng' in p1 ? p1.lng : 0;
    const lat2 = typeof p2 === 'object' && 'lat' in p2 ? p2.lat : 0;
    const lng2 = typeof p2 === 'object' && 'lng' in p2 ? p2.lng : 0;

    area +=
      toRadians(lng2 - lng1) *
      (2 + Math.sin(toRadians(lat1)) + Math.sin(toRadians(lat2)));
  }

  area = (area * R * R) / 2;
  const areaInSquareKm = Math.abs(area) / 1_000_000;

  return areaInSquareKm;
}
