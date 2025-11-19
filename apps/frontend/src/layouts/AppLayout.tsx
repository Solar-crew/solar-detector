import { MapContainer, TileLayer, useMap as useLeafletMap } from 'react-leaflet';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { MapControls } from '@/components/MapControls';
import { Sidebar } from '@/components/Sidebar';
import { AnalysisToolbar } from '@/components/AnalysisToolbar';
import { ShapeSelector } from '@/components/ShapeSelector';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { MapInteractionHandler } from '@/components/MapInteractionHandler';
import { MapPins } from '@/components/MapPins';
import { MapShapes } from '@/components/MapShapes';
import { ClearConfirmationDialog } from '@/components/ClearConfirmationDialog';
import { ReplaceConfirmationDialog } from '@/components/ReplaceConfirmationDialog';
import { useAuth } from '@/hooks/useAuth';
import { useMap } from '@/contexts/MapContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme } = useTheme();

  // Default center (San Francisco)
  const center: [number, number] = user?.location
    ? [user.location.latitude, user.location.longitude]
    : [37.7749, -122.4194];

  // Map tile URLs for light and dark themes
  const tileConfig = theme === 'dark'
    ? {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      }
    : {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Full-screen Leaflet Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
          <MapConnector />
          <TileLayer
            key={theme} // Force re-render when theme changes
            attribution={tileConfig.attribution}
            url={tileConfig.url}
          />
          <MapInteractionHandler />
          <MapPins />
          <MapShapes />
        </MapContainer>
      </div>

      {/* Map Controls (Search + Location) - includes Theme Toggle and Logout */}
      <MapControls />

      {/* Sidebar with tabs */}
      <Sidebar />

      {/* Analysis Toolbar & Analyze Button (bottom center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <AnalysisToolbar />
        <AnalyzeButton />
      </div>

      {/* Shape Selector (appears when pin is placed) */}
      <ShapeSelector />

      {/* Confirmation Dialogs */}
      <ClearConfirmationDialog />
      <ReplaceConfirmationDialog />

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          classNames: {
            toast: 'group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton: 'group-[.toast]:bg-accent group-[.toast]:text-accent-foreground',
            cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        }}
        richColors
      />
    </div>
  );
}
