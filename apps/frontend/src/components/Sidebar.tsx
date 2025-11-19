import { Home, Target, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { useAnalysis } from '@/contexts/AnalysisContext';
import type { SidebarTab } from '@/types/analysis';

const tabs: Array<{ id: SidebarTab; icon: typeof Home; label: string }> = [
  { id: 'home', icon: Home, label: 'Browse' },
  { id: 'analysis', icon: Target, label: 'Create Analysis' },
  { id: 'placeholder1', icon: Layers, label: 'Coming Soon' },
  { id: 'placeholder2', icon: Layers, label: 'Coming Soon' },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useAnalysis();

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isPlaceholder = tab.id.startsWith('placeholder');

        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="icon"
            onClick={() => !isPlaceholder && setActiveTab(tab.id)}
            disabled={isPlaceholder}
            className={`
              h-14 w-14 rounded-xl
              bg-card/95 backdrop-blur-sm border border-border
              shadow-lg hover:shadow-xl transition-all
              flex items-center justify-center
              ${isActive ? 'bg-accent/20 border-accent' : 'hover:bg-accent/10'}
              ${isPlaceholder ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={tab.label}
            title={tab.label}
          >
            <Icon className={`h-6 w-6 ${isActive ? 'text-accent' : ''}`} />
          </Button>
        );
      })}
    </div>
  );
}
