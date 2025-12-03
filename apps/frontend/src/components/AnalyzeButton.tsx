import { Target } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useAnalysis } from '@/contexts/AnalysisContext';

export function AnalyzeButton() {
  const { canAnalyze, activeTab, validateAndGetArea } = useAnalysis();

  if (activeTab !== 'analysis' || !canAnalyze) {
    return null;
  }

  const handleAnalyze = () => {
    const result = validateAndGetArea();

    if (!result) {
      toast.error('Invalid Selection', {
        description: 'Please select an area to analyze.',
      });
      return;
    }

    if (!result.valid) {
      toast.error('Area Too Large', {
        description: `Selected area (${result.area.toFixed(2)} km²) exceeds the maximum limit of 20 km².`,
      });
      return;
    }

    // TODO: Implement analysis logic
    toast.info('Starting Analysis', {
      description: `Analyzing ${result.area.toFixed(2)} km² area...`,
    });
    console.log('Starting analysis...', result);
  };

  return (
    <Button
      onClick={handleAnalyze}
      className="h-11 px-4 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-accent/50 transition-all font-medium text-sm ml-2"
    >
      <Target className="h-4 w-4 mr-1.5" />
      Analyze
    </Button>
  );
}
