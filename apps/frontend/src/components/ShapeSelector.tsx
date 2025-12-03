import { useState } from 'react';
import { Circle, Square, Hexagon, RectangleHorizontal, RectangleVertical, Type, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { useAnalysis } from '@/contexts/AnalysisContext';
import type { ShapeType } from '@/types/analysis';

const shapes: Array<{ type: ShapeType; icon: typeof Circle; label: string }> = [
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'square', icon: Square, label: 'Square' },
  { type: 'hexagon', icon: Hexagon, label: 'Hexagon' },
  { type: 'rect-h', icon: RectangleHorizontal, label: 'Rectangle (H)' },
  { type: 'rect-v', icon: RectangleVertical, label: 'Rectangle (V)' },
];

export function ShapeSelector() {
  const { activeTab, activeTool, activeShape, setShapeType, updateShapeSize } = useAnalysis();
  const [useKm, setUseKm] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (activeTab !== 'analysis' || activeTool !== 'pin-area' || !activeShape) {
    return null;
  }

  const isCircularShape = activeShape.type === 'circle' || activeShape.type === 'hexagon';
  const isRectangularShape = activeShape.type === 'square' || activeShape.type === 'rect-h' || activeShape.type === 'rect-v';

  // Convert between meters and kilometers
  const toDisplayUnit = (meters: number) => (useKm ? meters / 1000 : meters);
  const toMeters = (value: number) => (useKm ? value * 1000 : value);

  // Get min/max for slider based on unit
  const getSliderConfig = () => {
    if (useKm) {
      return { min: 0.01, max: 5, step: 0.01 };
    }
    return { min: 10, max: 5000, step: 10 };
  };

  const sliderConfig = getSliderConfig();

  const handleSizeChange = (field: 'radius' | 'width' | 'height', value: number) => {
    if (activeShape) {
      updateShapeSize({
        ...activeShape.size,
        [field]: value,
      });
    }
  };

  const handleSliderChange = (field: 'radius' | 'width' | 'height', values: number[]) => {
    const meters = toMeters(values[0]);
    handleSizeChange(field, meters);
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl overflow-hidden min-w-96">
        {/* Collapse/Expand Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-accent/10 transition-colors"
        >
          <span className="text-sm font-medium">Shape Settings</span>
          {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="p-4 pt-0 space-y-4">
          {/* Shape Type Selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Shape</Label>
            <div className="flex gap-2">
              {shapes.map((shape) => {
                const Icon = shape.icon;
                const isActive = activeShape.type === shape.type;

                return (
                  <Button
                    key={shape.type}
                    variant="ghost"
                    size="icon"
                    onClick={() => setShapeType(shape.type)}
                    className={`
                      h-12 w-12 rounded-lg
                      transition-all
                      flex items-center justify-center
                      ${isActive ? 'bg-accent/20 text-accent border-2 border-accent' : 'hover:bg-accent/10 border-2 border-transparent'}
                    `}
                    aria-label={shape.label}
                    title={shape.label}
                  >
                    <Icon className="h-6 w-6" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Size Controls */}
          <div className="space-y-3">
            {/* Unit Toggle for Radius */}
            {isCircularShape && (
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <Label className="text-sm">Unit</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${!useKm ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
                    meters
                  </span>
                  <Switch checked={useKm} onCheckedChange={setUseKm} />
                  <span className={`text-xs ${useKm ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
                    km
                  </span>
                </div>
              </div>
            )}

            {/* Input/Slider Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Input Mode</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInput(!showInput)}
                className="h-8 text-xs"
              >
                <Type className="h-3 w-3 mr-1" />
                {showInput ? 'Use Slider' : 'Use Input'}
              </Button>
            </div>

            {/* Radius (Circle/Hexagon) */}
            {isCircularShape && (
              <div className="space-y-2">
                <Label htmlFor="radius" className="text-sm">
                  Radius {useKm ? '(km)' : '(meters)'}
                </Label>
                {showInput ? (
                  <Input
                    id="radius"
                    type="number"
                    min={sliderConfig.min}
                    max={sliderConfig.max}
                    step={sliderConfig.step}
                    value={toDisplayUnit(activeShape.size.radius || 50).toFixed(useKm ? 2 : 0)}
                    onChange={(e) => handleSizeChange('radius', toMeters(parseFloat(e.target.value)))}
                    className="mt-1"
                  />
                ) : (
                  <div className="space-y-2">
                    <Slider
                      value={[toDisplayUnit(activeShape.size.radius || 50)]}
                      onValueChange={(values) => handleSliderChange('radius', values)}
                      min={sliderConfig.min}
                      max={sliderConfig.max}
                      step={sliderConfig.step}
                      className="mt-2"
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {toDisplayUnit(activeShape.size.radius || 50).toFixed(useKm ? 2 : 0)} {useKm ? 'km' : 'm'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Width/Height (Rectangles/Square) */}
            {isRectangularShape && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-sm">
                    Width (meters)
                  </Label>
                  {showInput ? (
                    <Input
                      id="width"
                      type="number"
                      min="10"
                      max="5000"
                      step="10"
                      value={activeShape.size.width || 100}
                      onChange={(e) => handleSizeChange('width', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <div className="space-y-2">
                      <Slider
                        value={[activeShape.size.width || 100]}
                        onValueChange={(values) => handleSizeChange('width', values[0])}
                        min={10}
                        max={5000}
                        step={10}
                        className="mt-2"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        {activeShape.size.width || 100} m
                      </div>
                    </div>
                  )}
                </div>

                {activeShape.type !== 'square' && (
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm">
                      Height (meters)
                    </Label>
                    {showInput ? (
                      <Input
                        id="height"
                        type="number"
                        min="10"
                        max="5000"
                        step="10"
                        value={activeShape.size.height || 100}
                        onChange={(e) => handleSizeChange('height', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <div className="space-y-2">
                        <Slider
                          value={[activeShape.size.height || 100]}
                          onValueChange={(values) => handleSizeChange('height', values[0])}
                          min={10}
                          max={5000}
                          step={10}
                          className="mt-2"
                        />
                        <div className="text-center text-sm text-muted-foreground">
                          {activeShape.size.height || 100} m
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
