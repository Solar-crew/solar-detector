import { SolarPanel } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <Link to="/app" className="flex items-center gap-2 font-semibold text-lg self-start">
        <SolarPanel className="size-8 text-accent" />
      </Link>
    </div>
  );
}
