import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { useAnalysis } from '@/contexts/AnalysisContext';

export function ClearConfirmationDialog() {
  const { showClearConfirmation, setShowClearConfirmation, pendingTool, clearAll, setActiveTool } =
    useAnalysis();

  const handleConfirm = () => {
    clearAll();
    if (pendingTool !== null) {
      setActiveTool(pendingTool, true);
    }
    setShowClearConfirmation(false);
  };

  const handleCancel = () => {
    setShowClearConfirmation(false);
  };

  return (
    <Dialog open={showClearConfirmation} onOpenChange={setShowClearConfirmation}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clear Current Selection?</DialogTitle>
          <DialogDescription>
            Switching tools will clear your current selection. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Clear & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
