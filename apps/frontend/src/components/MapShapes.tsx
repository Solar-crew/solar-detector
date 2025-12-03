import { Circle, Rectangle, Polygon } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useAnalysis } from '@/contexts/AnalysisContext';

// Helper to create hexagon points
function createHexagon(center: LatLngExpression, radius: number): LatLngExpression[] {
  const points: LatLngExpression[] = [];
  const lat = typeof center === 'object' && 'lat' in center ? center.lat : 0;
  const lng = typeof center === 'object' && 'lng' in center ? center.lng : 0;

  // Create 6 points for hexagon
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const pointLat = lat + (radius / 111000) * Math.cos(angle); // ~111km per degree
    const pointLng = lng + (radius / (111000 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    points.push([pointLat, pointLng]);
  }

  return points;
}

export function MapShapes() {
  const { activeShape, polygon } = useAnalysis();

  const shapeStyle = {
    color: 'var(--accent)',
    fillColor: 'var(--accent)',
    fillOpacity: 0.2,
    weight: 3,
  };

  return (
    <>
      {/* Render single-pin shape */}
      {activeShape && (
        <>
          {activeShape.type === 'circle' && activeShape.size.radius && (
            <Circle
              center={activeShape.pin.position}
              radius={activeShape.size.radius}
              pathOptions={shapeStyle}
            />
          )}

          {activeShape.type === 'square' && activeShape.size.width && (
            <Rectangle
              bounds={[
                [
                  activeShape.pin.position.lat - activeShape.size.width / 222000,
                  activeShape.pin.position.lng - activeShape.size.width / 222000,
                ],
                [
                  activeShape.pin.position.lat + activeShape.size.width / 222000,
                  activeShape.pin.position.lng + activeShape.size.width / 222000,
                ],
              ]}
              pathOptions={shapeStyle}
            />
          )}

          {activeShape.type === 'hexagon' && activeShape.size.radius && (
            <Polygon
              positions={createHexagon(activeShape.pin.position, activeShape.size.radius)}
              pathOptions={shapeStyle}
            />
          )}

          {activeShape.type === 'rect-h' && activeShape.size.width && activeShape.size.height && (
            <Rectangle
              bounds={[
                [
                  activeShape.pin.position.lat - activeShape.size.height / 222000,
                  activeShape.pin.position.lng - activeShape.size.width / 222000,
                ],
                [
                  activeShape.pin.position.lat + activeShape.size.height / 222000,
                  activeShape.pin.position.lng + activeShape.size.width / 222000,
                ],
              ]}
              pathOptions={shapeStyle}
            />
          )}

          {activeShape.type === 'rect-v' && activeShape.size.width && activeShape.size.height && (
            <Rectangle
              bounds={[
                [
                  activeShape.pin.position.lat - activeShape.size.width / 222000,
                  activeShape.pin.position.lng - activeShape.size.height / 222000,
                ],
                [
                  activeShape.pin.position.lat + activeShape.size.width / 222000,
                  activeShape.pin.position.lng + activeShape.size.height / 222000,
                ],
              ]}
              pathOptions={shapeStyle}
            />
          )}
        </>
      )}

      {/* Render multi-pin polygon */}
      {polygon.length >= 3 && (
        <Polygon positions={polygon} pathOptions={shapeStyle} />
      )}
    </>
  );
}
