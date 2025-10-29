import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Eraser, Undo, Redo, Trash2, Download, X } from 'lucide-react';

interface WhiteboardCanvasProps {
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  isEraser?: boolean;
}

const COLORS = [
  '#1a1a1a', // Black
  '#f87171', // Soft Red
  '#60a5fa', // Soft Blue
  '#34d399', // Soft Green
  '#a78bfa', // Soft Purple
  '#f472b6', // Soft Pink
  '#fbbf24', // Soft Yellow
];

export default function WhiteboardCanvas({ onClose }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [undoneSteps, setUndoneSteps] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState([3]);
  const [isErasing, setIsErasing] = useState(false);

  // Load saved whiteboard on mount
  useEffect(() => {
    const saved = localStorage.getItem('whiteboard');
    if (saved) {
      try {
        const savedPaths = JSON.parse(saved);
        setPaths(savedPaths);
      } catch (e) {
        console.error('Failed to load whiteboard:', e);
      }
    }
  }, []);

  // Save whiteboard whenever paths change
  useEffect(() => {
    if (paths.length > 0) {
      localStorage.setItem('whiteboard', JSON.stringify(paths));
    }
  }, [paths]);

  // Redraw canvas whenever paths change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = path.isEraser ? 'destination-out' : 'source-over';

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [paths]);

  const detectShape = (points: Point[]): DrawingPath | null => {
    if (points.length < 10) return null;

    // Calculate bounding box
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Check if it's a straight line
    if (width < 10 || height < 10) {
      const isHorizontal = width > height;
      return {
        points: isHorizontal 
          ? [{ x: minX, y: centerY }, { x: maxX, y: centerY }]
          : [{ x: centerX, y: minY }, { x: centerX, y: maxY }],
        color: selectedColor,
        width: lineWidth[0],
      };
    }

    // Check if it's a circle (aspect ratio close to 1 and path returns near start)
    const aspectRatio = Math.max(width, height) / Math.min(width, height);
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const distanceToStart = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    );
    const avgDimension = (width + height) / 2;

    if (aspectRatio < 1.3 && distanceToStart < avgDimension * 0.2) {
      // Generate circle points
      const radius = avgDimension / 2;
      const circlePoints: Point[] = [];
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        circlePoints.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
      return {
        points: circlePoints,
        color: selectedColor,
        width: lineWidth[0],
      };
    }

    // Check if it's a rectangle (4 corners detected)
    const corners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
      { x: minX, y: minY },
    ];

    // Check if path roughly follows rectangle corners
    let matchesRectangle = true;
    const threshold = avgDimension * 0.15;
    
    for (let i = 0; i < Math.min(points.length, 20); i++) {
      const point = points[Math.floor((i / 20) * points.length)];
      const minDist = Math.min(
        Math.abs(point.x - minX) + Math.abs(point.y - minY),
        Math.abs(point.x - maxX) + Math.abs(point.y - minY),
        Math.abs(point.x - maxX) + Math.abs(point.y - maxY),
        Math.abs(point.x - minX) + Math.abs(point.y - maxY),
        Math.min(Math.abs(point.x - minX), Math.abs(point.x - maxX)),
        Math.min(Math.abs(point.y - minY), Math.abs(point.y - maxY))
      );
      
      if (minDist > threshold) {
        matchesRectangle = false;
        break;
      }
    }

    if (matchesRectangle && distanceToStart < avgDimension * 0.25) {
      return {
        points: corners,
        color: selectedColor,
        width: lineWidth[0],
      };
    }

    return null;
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = getCoordinates(e);
    setCurrentPath([point]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCoordinates(e);
    const newPath = [...currentPath, point];
    setCurrentPath(newPath);

    // Draw current stroke in real-time
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = isErasing ? '#ffffff' : selectedColor;
    ctx.lineWidth = lineWidth[0];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';

    if (currentPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length < 2) {
      setCurrentPath([]);
      return;
    }

    // Try to detect shape if not erasing
    let finalPath: DrawingPath;
    
    if (!isErasing) {
      const detectedShape = detectShape(currentPath);
      if (detectedShape) {
        finalPath = detectedShape;
        toast.success('Shape detected and cleaned up!');
      } else {
        finalPath = {
          points: currentPath,
          color: selectedColor,
          width: lineWidth[0],
        };
      }
    } else {
      finalPath = {
        points: currentPath,
        color: '#ffffff',
        width: lineWidth[0] * 2,
        isEraser: true,
      };
    }

    setPaths([...paths, finalPath]);
    setCurrentPath([]);
    setUndoneSteps([]); // Clear redo stack when new action is made
  };

  const undo = () => {
    if (paths.length === 0) return;
    const lastPath = paths[paths.length - 1];
    setPaths(paths.slice(0, -1));
    setUndoneSteps([...undoneSteps, lastPath]);
    toast.info('Undo');
  };

  const redo = () => {
    if (undoneSteps.length === 0) return;
    const lastUndone = undoneSteps[undoneSteps.length - 1];
    setPaths([...paths, lastUndone]);
    setUndoneSteps(undoneSteps.slice(0, -1));
    toast.info('Redo');
  };

  const clearCanvas = () => {
    setPaths([]);
    setUndoneSteps([]);
    localStorage.removeItem('whiteboard');
    toast.success('Canvas cleared!');
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.download = `whiteboard_${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Whiteboard downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold text-foreground">Whiteboard</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
          <Card className="shadow-glow">
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              className="cursor-crosshair bg-white rounded-lg"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </Card>
        </div>

        {/* Toolbar */}
        <div className="w-72 border-l border-border bg-card p-6 space-y-6">
          {/* Color Picker */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Marker Color</label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setIsErasing(false);
                  }}
                  className={`w-12 h-12 rounded-lg transition-all border-2 ${
                    selectedColor === color && !isErasing
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 border-primary'
                      : 'border-border hover:scale-105 hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Line Thickness: {lineWidth[0]}px</label>
            <Slider
              value={lineWidth}
              onValueChange={setLineWidth}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Tools */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Tools</label>
            <Button
              variant={isErasing ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setIsErasing(!isErasing)}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Eraser
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={undo}
              disabled={paths.length === 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={redo}
              disabled={undoneSteps.length === 0}
            >
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={downloadCanvas}
              disabled={paths.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={clearCanvas}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Canvas
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
            <p>✨ Draw shapes and they auto-adjust!</p>
            <p>🔵 Circles, rectangles, and lines</p>
            <p>💾 Your work is auto-saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
