import { Outlet, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { SunMedium, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import 'leaflet/dist/leaflet.css';

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Default center (San Francisco)
  const center: [number, number] = user?.location
    ? [user.location.latitude, user.location.longitude]
    : [37.7749, -122.4194];

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Full-screen Leaflet Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 font-semibold text-lg">
            <SunMedium className="w-6 h-6 text-accent" />
            Solar Detector
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Top-Left Floating Panel */}
      <div className="absolute top-20 left-4 z-10 w-96 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
