import type { LatLng } from 'leaflet';

export type SidebarTab = 'home' | 'analysis' | 'placeholder1' | 'placeholder2';

export type AnalysisTool = 'hand' | 'pin-area' | 'multi-pin' | null;

export type ShapeType = 'circle' | 'square' | 'hexagon' | 'rect-h' | 'rect-v';

export interface Pin {
  id: string;
  position: LatLng;
  number?: number; // For multi-pin mode
}

export interface ShapeData {
  id: string;
  type: ShapeType;
  pin: Pin;
  size: {
    radius?: number; // For circle, hexagon
    width?: number; // For rectangles, square
    height?: number; // For rectangles
  };
}

export interface AnalysisState {
  activeTab: SidebarTab;
  activeTool: AnalysisTool;
  pins: Pin[];
  activeShape: ShapeData | null; // Only one shape at a time for pin-area mode
  polygon: LatLng[];
  canAnalyze: boolean;
}
