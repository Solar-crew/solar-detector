import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { LatLng } from 'leaflet';
import {
  calculateCircleArea,
  calculateRectangleArea,
  calculateHexagonArea,
  calculatePolygonArea,
} from '@/utils/areaCalculations';
import type {
  SidebarTab,
  AnalysisTool,
  ShapeType,
  Pin,
  ShapeData,
  AnalysisState,
} from '@/types/analysis';

interface AnalysisContextType extends AnalysisState {
  setActiveTab: (tab: SidebarTab) => void;
  setActiveTool: (tool: AnalysisTool, skipConfirmation?: boolean) => void;
  addPin: (position: LatLng, skipConfirmation?: boolean) => void;
  updatePinPosition: (pinId: string, newPosition: LatLng) => void;
  removeLastPin: () => void;
  clearAll: () => void;
  setShapeType: (type: ShapeType) => void;
  updateShapeSize: (size: ShapeData['size']) => void;
  validateAndGetArea: () => { valid: boolean; area: number } | null;
  showClearConfirmation: boolean;
  setShowClearConfirmation: (show: boolean) => void;
  pendingTool: AnalysisTool;
  setPendingTool: (tool: AnalysisTool) => void;
  showReplaceConfirmation: boolean;
  setShowReplaceConfirmation: (show: boolean) => void;
  pendingPinPosition: LatLng | null;
  setPendingPinPosition: (position: LatLng | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('home');
  const [activeTool, setActiveTool] = useState<AnalysisTool>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [activeShape, setActiveShape] = useState<ShapeData | null>(null);
  const [polygon, setPolygon] = useState<LatLng[]>([]);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [pendingTool, setPendingTool] = useState<AnalysisTool>(null);
  const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);
  const [pendingPinPosition, setPendingPinPosition] = useState<LatLng | null>(null);

  const canAnalyze =
    (activeShape !== null && activeShape.size.radius !== undefined) ||
    (activeShape !== null && activeShape.size.width !== undefined) ||
    polygon.length >= 3;

  const addPin = useCallback(
    (position: LatLng, skipConfirmation = false) => {
      if (activeTool === 'multi-pin') {
        // Multi-pin mode: add numbered pin and update polygon
        const newPin: Pin = {
          id: `pin-${Date.now()}`,
          position,
          number: pins.length + 1,
        };
        setPins((prev) => [...prev, newPin]);
        setPolygon((prev) => [...prev, position]);
      } else if (activeTool === 'pin-area') {
        // Pin-area mode: show confirmation if shape already exists
        if (!skipConfirmation && activeShape !== null) {
          setPendingPinPosition(position);
          setShowReplaceConfirmation(true);
        } else {
          // Clear previous pin/shape and create new one
          const newPin: Pin = {
            id: `pin-${Date.now()}`,
            position,
          };
          setPins([newPin]); // Replace pins array with just the new pin
          setActiveShape({
            id: `shape-${Date.now()}`,
            type: 'circle',
            pin: newPin,
            size: { radius: 50 }, // Default 50 meters
          });
        }
      }
    },
    [activeTool, pins.length, activeShape]
  );

  const updatePinPosition = useCallback(
    (pinId: string, newPosition: LatLng) => {
      setPins((prev) =>
        prev.map((pin) => (pin.id === pinId ? { ...pin, position: newPosition } : pin))
      );

      if (activeTool === 'multi-pin') {
        // Update polygon with new positions
        setPolygon((prev) => {
          const pinIndex = pins.findIndex((p) => p.id === pinId);
          if (pinIndex !== -1) {
            const newPolygon = [...prev];
            newPolygon[pinIndex] = newPosition;
            return newPolygon;
          }
          return prev;
        });
      } else if (activeTool === 'pin-area' && activeShape && activeShape.pin.id === pinId) {
        // Update the shape's pin position
        setActiveShape({
          ...activeShape,
          pin: { ...activeShape.pin, position: newPosition },
        });
      }
    },
    [activeTool, pins, activeShape]
  );

  const removeLastPin = useCallback(() => {
    if (activeTool === 'multi-pin') {
      setPins((prev) => {
        const newPins = prev.slice(0, -1);
        setPolygon(newPins.map((p) => p.position));
        return newPins;
      });
    } else if (activeTool === 'pin-area') {
      // Clear the single pin and shape
      setPins([]);
      setActiveShape(null);
    }
  }, [activeTool]);

  const clearAll = useCallback(() => {
    setPins([]);
    setActiveShape(null);
    setPolygon([]);
  }, []);

  const setShapeType = useCallback(
    (type: ShapeType) => {
      if (activeShape) {
        setActiveShape({
          ...activeShape,
          type,
          size:
            type === 'circle' || type === 'hexagon'
              ? { radius: 50 }
              : type === 'square'
                ? { width: 100, height: 100 }
                : { width: 150, height: 100 },
        });
      }
    },
    [activeShape]
  );

  const updateShapeSize = useCallback(
    (size: ShapeData['size']) => {
      if (activeShape) {
        setActiveShape({
          ...activeShape,
          size,
        });
      }
    },
    [activeShape]
  );

  const handleSetActiveTab = useCallback((tab: SidebarTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setActiveTool(null);
      setPins([]);
      setActiveShape(null);
      setPolygon([]);
    } else if (tab === 'analysis') {
      setActiveTool('hand');
    }
  }, []);

  const handleSetActiveTool = useCallback(
    (tool: AnalysisTool, skipConfirmation = false) => {
      // Hand mode doesn't trigger confirmation
      if (tool === 'hand') {
        setActiveTool(tool);
        return;
      }

      // Check if switching away from pin-area or multi-pin with active data
      const hasActiveData =
        (activeTool === 'pin-area' && activeShape !== null) ||
        (activeTool === 'multi-pin' && polygon.length > 0);

      if (!skipConfirmation && hasActiveData && tool !== activeTool) {
        setPendingTool(tool);
        setShowClearConfirmation(true);
      } else {
        setActiveTool(tool);
      }
    },
    [activeTool, activeShape, polygon.length]
  );

  const validateAndGetArea = useCallback(() => {
    const MAX_AREA_KM2 = 20;
    let currentArea = 0;

    if (activeShape) {
      const { type, size } = activeShape;

      if (type === 'circle' && size.radius) {
        currentArea = calculateCircleArea(size.radius);
      } else if (type === 'hexagon' && size.radius) {
        currentArea = calculateHexagonArea(size.radius);
      } else if (type === 'square' && size.width) {
        currentArea = calculateRectangleArea(size.width, size.width);
      } else if ((type === 'rect-h' || type === 'rect-v') && size.width && size.height) {
        currentArea = calculateRectangleArea(size.width, size.height);
      }

      return {
        valid: currentArea <= MAX_AREA_KM2,
        area: currentArea,
      };
    } else if (polygon.length >= 3) {
      currentArea = calculatePolygonArea(polygon);

      return {
        valid: currentArea <= MAX_AREA_KM2,
        area: currentArea,
      };
    }

    return null;
  }, [activeShape, polygon]);

  return (
    <AnalysisContext.Provider
      value={{
        activeTab,
        activeTool,
        pins,
        activeShape,
        polygon,
        canAnalyze,
        setActiveTab: handleSetActiveTab,
        setActiveTool: handleSetActiveTool,
        addPin,
        updatePinPosition,
        removeLastPin,
        clearAll,
        setShapeType,
        updateShapeSize,
        validateAndGetArea,
        showClearConfirmation,
        setShowClearConfirmation,
        pendingTool,
        setPendingTool,
        showReplaceConfirmation,
        setShowReplaceConfirmation,
        pendingPinPosition,
        setPendingPinPosition,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
