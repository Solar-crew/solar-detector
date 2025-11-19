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

export function ReplaceConfirmationDialog() {
  const {
    showReplaceConfirmation,
    setShowReplaceConfirmation,
    pendingPinPosition,
    addPin,
    setPendingPinPosition,
  } = useAnalysis();

  const handleConfirm = () => {
    if (pendingPinPosition) {
      addPin(pendingPinPosition, true);
      setPendingPinPosition(null);
    }
    setShowReplaceConfirmation(false);
  };

  const handleCancel = () => {
    setPendingPinPosition(null);
    setShowReplaceConfirmation(false);
  };

  return (
    <Dialog open={showReplaceConfirmation} onOpenChange={setShowReplaceConfirmation}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Replace Current Pin?</DialogTitle>
          <DialogDescription>
            Placing a new pin will remove the current pin and its shape. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Replace Pin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
