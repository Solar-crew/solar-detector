import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useRef } from 'react';

export function MapPins() {
  const { pins, activeTool, updatePinPosition } = useAnalysis();
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  return (
    <>
      {pins.map((pin) => {
        // Create custom icon with number for multi-pin mode
        const icon = divIcon({
          className: 'custom-pin-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: var(--accent);
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              color: var(--accent-foreground);
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              cursor: move;
            ">
              ${pin.number !== undefined ? pin.number : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        return (
          <Marker
            key={pin.id}
            position={pin.position}
            icon={icon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newPosition = marker.getLatLng();
                updatePinPosition(pin.id, newPosition);
              },
            }}
            ref={(ref) => {
              if (ref) {
                markerRefs.current.set(pin.id, ref);
              }
            }}
          >
            <Popup>
              {activeTool === 'multi-pin'
                ? `Pin ${pin.number}`
                : 'Analysis Pin'}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
