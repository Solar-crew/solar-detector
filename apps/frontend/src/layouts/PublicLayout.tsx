import { Outlet, Link } from 'react-router-dom';
import { SolarPanel } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function PublicLayout() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <SolarPanel className="w-6 h-6 text-accent" />
            Solar Detector
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
