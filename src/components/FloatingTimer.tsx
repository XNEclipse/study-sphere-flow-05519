import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FloatingTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  sessionName: string;
  onClose: () => void;
}

export function FloatingTimer({ timeRemaining, isRunning, sessionName, onClose }: FloatingTimerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardClick = () => {
    navigate('/builder');
  };

  if (isMinimized) {
    return (
      <Card 
        className="fixed bottom-4 right-4 z-50 shadow-glow border-2 border-primary cursor-pointer hover:scale-105 transition-transform"
        onClick={handleCardClick}
      >
        <div className="p-3 flex items-center gap-3">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {formatTime(timeRemaining)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="fixed bottom-4 right-4 z-50 shadow-glow border-2 border-primary w-80 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate flex-1">{sessionName}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary tabular-nums">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isRunning ? 'In Progress' : 'Paused'}
          </div>
        </div>
      </div>
    </Card>
  );
}
