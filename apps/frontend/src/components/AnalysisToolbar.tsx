import { Hand, MapPin, MapPinned, Undo, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAnalysis } from '@/contexts/AnalysisContext';
import type { AnalysisTool } from '@/types/analysis';

const tools: Array<{
  id: AnalysisTool;
  icon: typeof Hand;
  label: string;
  description: string;
}> = [
  { id: 'hand', icon: Hand, label: 'Pan', description: 'Move around the map' },
  {
    id: 'pin-area',
    icon: MapPin,
    label: 'Pin Area',
    description: 'Place pin with shape selection',
  },
  {
    id: 'multi-pin',
    icon: MapPinned,
    label: 'Multi-Pin',
    description: 'Select area with multiple pins',
  },
];

export function AnalysisToolbar() {
  const { activeTab, activeTool, setActiveTool, removeLastPin, clearAll, pins } = useAnalysis();

  if (activeTab !== 'analysis') {
    return null;
  }

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-2xl px-2 py-2">
      <div className="flex items-center gap-1">
          {/* Tool Buttons */}
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <Button
                key={tool.id}
                variant="ghost"
                size="icon"
                onClick={() => setActiveTool(tool.id)}
                className={`
                  h-11 w-11 rounded-full
                  transition-all
                  flex items-center justify-center
                  ${isActive ? 'bg-accent/20 text-accent' : 'hover:bg-accent/10'}
                `}
                aria-label={tool.label}
                title={tool.description}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-8 bg-border mx-1" />

          {/* Undo Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={removeLastPin}
            disabled={pins.length === 0}
            className="h-11 w-11 rounded-full hover:bg-accent/10 flex items-center justify-center disabled:opacity-50"
            aria-label="Undo last pin"
            title="Undo last pin"
          >
            <Undo className="h-5 w-5" />
          </Button>

          {/* Clear Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAll}
            disabled={pins.length === 0}
            className="h-11 w-11 rounded-full hover:bg-destructive/20 hover:text-destructive text-muted-foreground flex items-center justify-center disabled:opacity-50 transition-colors"
            aria-label="Clear all"
            title="Clear all pins and shapes"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
    </div>
  );
}
