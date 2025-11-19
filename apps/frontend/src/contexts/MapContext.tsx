import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface MapContextType {
  map: LeafletMap | null;
  setMap: (map: LeafletMap | null) => void;
  userLocation: [number, number] | null;
  setUserLocation: (location: [number, number] | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  return (
    <MapContext.Provider value={{ map, setMap, userLocation, setUserLocation }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
