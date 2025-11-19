import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMap } from '@/contexts/MapContext';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export function MapSearchBar() {
  const { map } = useMap();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    // Debounced search
    if (query.length < 3) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsLoading(true);

    timeoutRef.current = window.setTimeout(async () => {
      try {
        // Try to parse as coordinates first (format: lat,lon or lat, lon)
        const coordMatch = query.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lon = parseFloat(coordMatch[2]);

          if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            setResults([
              {
                display_name: `Coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}`,
                lat: lat.toString(),
                lon: lon.toString(),
                type: 'coordinates',
              },
            ]);
            setIsLoading(false);
            return;
          }
        }

        // Search by name using Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`,
          {
            headers: {
              'User-Agent': 'SolarDetector/1.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (map) {
      map.flyTo([lat, lon], 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }

    setQuery('');
    setResults([]);
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      {/* Search Button / Input Container */}
      <div
        className={`
          flex items-center gap-2 backdrop-blur-sm border border-border rounded-full shadow-lg
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-80' : 'w-10'}
        `}
      >
        {/* Search Icon Button */}
        {!isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(true)}
            className="h-10 w-10 rounded-full hover:bg-accent/10 bg-card/95"
            aria-label="Search location"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* Expanded Input */}
        {isExpanded && (
          <>
            <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search by name or coordinates (lat, lon)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent flex-1 h-10"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full mr-1 shrink-0"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isExpanded && results.length > 0 && (
        <div className="absolute top-12 left-0 right-0 bg-card border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
            >
              <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <span className="text-sm">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
