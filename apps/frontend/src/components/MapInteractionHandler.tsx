import { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useAnalysis } from '@/contexts/AnalysisContext';

export function MapInteractionHandler() {
  const { activeTab, activeTool, addPin } = useAnalysis();

  const map = useMapEvents({
    click(e) {
      // Only handle clicks in analysis mode with an active tool
      if (activeTab === 'analysis' && activeTool && activeTool !== 'hand') {
        addPin(e.latlng);
      }
    },
  });

  useEffect(() => {
    // Update map dragging based on tool
    if (activeTab === 'analysis') {
      if (activeTool === 'hand' || activeTool === null) {
        map.dragging.enable();
        map.getContainer().style.cursor = 'grab';
      } else {
        map.dragging.disable();
        map.getContainer().style.cursor = 'crosshair';
      }
    } else {
      map.dragging.enable();
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.dragging.enable();
      map.getContainer().style.cursor = '';
    };
  }, [map, activeTab, activeTool]);

  return null;
}
