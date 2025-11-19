import { Outlet } from 'react-router-dom';
import { MapContainer, TileLayer, useMap as useLeafletMap } from 'react-leaflet';
import { useEffect } from 'react';
import { MapControls } from '@/components/MapControls';
import { useAuth } from '@/hooks/useAuth';
import { useMap } from '@/contexts/MapContext';
import 'leaflet/dist/leaflet.css';

// Helper component to connect Leaflet map to context
function MapConnector() {
  const leafletMap = useLeafletMap();
  const { setMap } = useMap();

  useEffect(() => {
    setMap(leafletMap);
    return () => setMap(null);
  }, [leafletMap, setMap]);

  return null;
}

export function AppLayout() {
  const { user } = useAuth();

  // Default center (San Francisco)
  const center: [number, number] = user?.location
    ? [user.location.latitude, user.location.longitude]
    : [37.7749, -122.4194];

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Full-screen Leaflet Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
          <MapConnector />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>

      {/* Map Controls (Search + Location) - includes Theme Toggle and Logout */}
      <MapControls />

      {/* Top-Left Floating Panel */}
      <div className="absolute top-4 left-4 z-10 w-20 h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2 pt-4 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
