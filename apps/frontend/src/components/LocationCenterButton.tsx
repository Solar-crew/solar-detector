import { useState } from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMap } from '@/contexts/MapContext';

export function LocationCenterButton() {
  const { map, setUserLocation } = useMap();
  const [isLoading, setIsLoading] = useState(false);

  const handleCenterToLocation = () => {
    if (!map) return;

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];

        setUserLocation(coords);
        map.flyTo(coords, 15, {
          duration: 1.5,
          easeLinearity: 0.25,
        });

        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = 'Failed to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCenterToLocation}
      disabled={isLoading || !map}
      className="h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all hover:bg-accent/10 flex items-center justify-center"
      aria-label="Center to my location"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Navigation className="h-5 w-5" />
      )}
    </Button>
  );
}
