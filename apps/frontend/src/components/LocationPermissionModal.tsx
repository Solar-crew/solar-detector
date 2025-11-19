import { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LocationPermissionModalProps {
  open: boolean;
  onClose: () => void;
  onPermissionResult: (location?: { latitude: number; longitude: number }) => void;
}

export function LocationPermissionModal({
  open,
  onClose,
  onPermissionResult,
}: LocationPermissionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAllowLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLoading(false);
        onPermissionResult({ latitude, longitude });
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = 'Failed to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. You can still continue without location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setError(errorMessage);
      }
    );
  };

  const handleSkip = () => {
    onPermissionResult();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Enable Location Access
          </DialogTitle>
          <DialogDescription className="space-y-4">
            <p>
              Solar Detector would like to access your location to provide personalized solar
              analysis for your area.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <strong className="block mb-1">Why we need this:</strong>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Center the map on your current location</li>
                <li>Provide accurate sunlight analysis for your area</li>
                <li>Show nearby solar installations</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            Skip for Now
          </Button>
          <Button onClick={handleAllowLocation} disabled={isLoading}>
            {isLoading ? 'Getting Location...' : 'Allow Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
