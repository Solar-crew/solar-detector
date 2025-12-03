import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { MapSearchBar } from './MapSearchBar';
import { LocationCenterButton } from './LocationCenterButton';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';

export function MapControls() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
      <MapSearchBar />
      <LocationCenterButton />
      <ThemeToggle
        variant="ghost"
        className="h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all hover:bg-accent/10 flex items-center justify-center"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        className="h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all hover:bg-accent/10 flex items-center justify-center"
        aria-label="Logout"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
