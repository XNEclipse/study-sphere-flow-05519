import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { FloatingTimer } from "@/components/FloatingTimer";
import { 
  Plus, 
  PlayCircle, 
  Timer, 
  Brain, 
  FileText, 
  RotateCcw,
  Coffee,
  Trash2,
  GripVertical,
  Save,
  Pause,
  Play,
  RotateCw
} from "lucide-react";

const availableSteps = [
  { id: "pomodoro", name: "Pomodoro Block", icon: Timer, duration: "25 min", color: "bg-red-100 text-red-700" },
  { id: "active-recall", name: "Active Recall", icon: Brain, duration: "15 min", color: "bg-blue-100 text-blue-700" },
  { id: "feynman", name: "Feynman Technique", icon: RotateCcw, duration: "20 min", color: "bg-green-100 text-green-700" },
  { id: "notes", name: "Note Summary", icon: FileText, duration: "20 min", color: "bg-purple-100 text-purple-700" },
  { id: "break", name: "Break", icon: Coffee, duration: "5 min", color: "bg-yellow-100 text-yellow-700" }
];

export default function SessionBuilder() {
  const [sessionSteps, setSessionSteps] = useState([
    { id: "1", type: "pomodoro", name: "Pomodoro Block", duration: "25 min", customDuration: 25 },
    { id: "2", type: "break", name: "Short Break", duration: "5 min", customDuration: 5 }
  ]);
  
  const [sessionName, setSessionName] = useState("");
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const [currentSessionStartTime, setCurrentSessionStartTime] = useState<number | null>(null);

  // Load timer state or preloaded session from localStorage on mount
  useEffect(() => {
    // Check for preloaded session first
    const preloadSession = localStorage.getItem("preloadSession");
    if (preloadSession) {
      const session = JSON.parse(preloadSession);
      setSessionSteps(session.steps);
      setSessionName(session.name);
      localStorage.removeItem("preloadSession");
      toast({
        title: "Session Loaded",
        description: `"${session.name}" has been loaded.`,
      });
      return;
    }

    // Load active timer if exists
    const savedTimer = localStorage.getItem("activeTimer");
    if (savedTimer) {
      const { timeRemaining: savedTime, isRunning, sessionName: savedName, startTime, steps } = JSON.parse(savedTimer);
      setTimeRemaining(savedTime);
      setIsTimerRunning(isRunning);
      setIsTimerVisible(true);
      setShowFloatingTimer(true);
      setSessionName(savedName);
      setCurrentSessionStartTime(startTime);
      if (steps) {
        setSessionSteps(steps);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (isTimerVisible) {
      localStorage.setItem("activeTimer", JSON.stringify({
        timeRemaining,
        isRunning: isTimerRunning,
        sessionName: sessionName || "Untitled Session",
        startTime: currentSessionStartTime,
        steps: sessionSteps
      }));
    }
  }, [timeRemaining, isTimerRunning, isTimerVisible, sessionName, currentSessionStartTime, sessionSteps]);

  const addStep = (stepType: any) => {
    const step = availableSteps.find(s => s.id === stepType);
    if (step) {
      const newStep = {
        id: Date.now().toString(),
        type: step.id,
        name: step.name,
        duration: step.duration,
        customDuration: parseInt(step.duration)
      };
      setSessionSteps([...sessionSteps, newStep]);
    }
  };

  const removeStep = (stepId: string) => {
    setSessionSteps(sessionSteps.filter(step => step.id !== stepId));
  };

  const getTotalDuration = () => {
    return sessionSteps.reduce((total, step) => total + step.customDuration, 0);
  };

  const loadTemplate = (templateType: string) => {
    let steps: any[] = [];
    
    switch (templateType) {
      case "focus-flow":
        steps = [
          { id: Date.now().toString(), type: "pomodoro", name: "Pomodoro Block", duration: "25 min", customDuration: 25 },
          { id: (Date.now() + 1).toString(), type: "break", name: "Break", duration: "5 min", customDuration: 5 },
          { id: (Date.now() + 2).toString(), type: "active-recall", name: "Active Recall", duration: "15 min", customDuration: 15 }
        ];
        break;
      case "deep-dive":
        steps = [
          { id: Date.now().toString(), type: "pomodoro", name: "Pomodoro Block", duration: "45 min", customDuration: 45 },
          { id: (Date.now() + 1).toString(), type: "break", name: "Break", duration: "15 min", customDuration: 15 },
          { id: (Date.now() + 2).toString(), type: "feynman", name: "Feynman Technique", duration: "30 min", customDuration: 30 }
        ];
        break;
      case "quick-review":
        steps = [
          { id: Date.now().toString(), type: "feynman", name: "Feynman Technique", duration: "10 min", customDuration: 10 },
          { id: (Date.now() + 1).toString(), type: "break", name: "Break", duration: "5 min", customDuration: 5 },
          { id: (Date.now() + 2).toString(), type: "active-recall", name: "Active Recall", duration: "10 min", customDuration: 10 }
        ];
        break;
    }
    
    setSessionSteps(steps);
  };

  const startSession = () => {
    const totalMinutes = getTotalDuration();
    const finalSessionName = sessionName.trim() || "Untitled Session";
    setTimeRemaining(totalMinutes * 60);
    setIsTimerVisible(true);
    setIsTimerRunning(true);
    setIsPaused(false);
    setShowFloatingTimer(true);
    setCurrentSessionStartTime(Date.now());
    setSessionName(finalSessionName);
    
    toast({
      title: "Session Started! 🚀",
      description: `"${finalSessionName}" is now in progress.`,
    });
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    const totalMinutes = getTotalDuration();
    setTimeRemaining(totalMinutes * 60);
    setIsTimerRunning(false);
    setIsPaused(false);
  };

  const endSession = () => {
    if (currentSessionStartTime) {
      const session = {
        id: Date.now().toString(),
        name: sessionName || "Untitled Session",
        duration: getTotalDuration(),
        completedAt: Date.now(),
        steps: sessionSteps
      };

      const sessions = JSON.parse(localStorage.getItem("recentSessions") || "[]");
      sessions.unshift(session);
      if (sessions.length > 10) sessions.pop();
      localStorage.setItem("recentSessions", JSON.stringify(sessions));
    }

    localStorage.removeItem("activeTimer");
    setIsTimerVisible(false);
    setShowFloatingTimer(false);
    setCurrentSessionStartTime(null);
    
    toast({
      title: "Session Complete! 🎉",
      description: "Your study session has ended. Great job!",
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Floating Timer */}
      {showFloatingTimer && (
        <FloatingTimer
          timeRemaining={timeRemaining}
          isRunning={isTimerRunning}
          sessionName={sessionName || "Untitled Session"}
          onClose={endSession}
        />
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-focus bg-clip-text text-transparent">
          Study Session Builder
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Design your perfect study flow by combining proven techniques. Drag, drop, and customize!
        </p>
      </div>

      {/* Session Name Input */}
      {!isTimerVisible && (
        <Card className="shadow-soft max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name (Optional)</Label>
              <Input
                id="session-name"
                placeholder="e.g., Physics Review, Math Practice..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Give your session a name to track it in your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Steps */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Available Steps
            </CardTitle>
            <CardDescription>
              Drag these into your session or click to add
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => addStep(step.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${step.color}`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.duration}</p>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Session Flow */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-primary" />
                  Your Session Flow
                </CardTitle>
                <CardDescription>
                  Total duration: {getTotalDuration()} minutes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
                <Button 
                  variant="hero" 
                  size="sm" 
                  disabled={sessionSteps.length === 0}
                  onClick={startSession}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sessionSteps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Your session is empty</p>
                <p className="text-sm">Add some study steps to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionSteps.map((step, index) => {
                  const stepConfig = availableSteps.find(s => s.id === step.type);
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="secondary" className="min-w-fit">
                          {index + 1}
                        </Badge>
                        
                        {stepConfig && (
                          <div className={`p-2 rounded-md ${stepConfig.color}`}>
                            <stepConfig.icon className="h-4 w-4" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-muted-foreground">{step.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timer Section */}
      {isTimerVisible && (
        <Card className="shadow-soft border-2 border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mb-2">
                <h3 className="text-xl font-semibold text-foreground">{sessionName || "Untitled Session"}</h3>
              </div>
              <div className="text-6xl font-bold text-primary tabular-nums">
                {formatTime(timeRemaining)}
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant={isTimerRunning ? "secondary" : "hero"}
                  size="lg"
                  onClick={toggleTimer}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      {isPaused ? "Resume" : "Start"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetTimer}
                >
                  <RotateCw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endSession}
                >
                  End Session
                </Button>
              </div>
              {timeRemaining === 0 && (
                <p className="text-lg text-success font-medium">
                  Session Complete! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>
            Start with proven session structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => loadTemplate("focus-flow")}
            >
              <h4 className="font-medium mb-2">Focus Flow</h4>
              <p className="text-sm text-muted-foreground mb-3">Pomodoro + Active Recall</p>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">25 min</Badge>
                <Badge variant="outline" className="text-xs">5 min break</Badge>
                <Badge variant="outline" className="text-xs">15 min recall</Badge>
              </div>
            </div>

            <div 
              className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => loadTemplate("deep-dive")}
            >
              <h4 className="font-medium mb-2">Deep Dive</h4>
              <p className="text-sm text-muted-foreground mb-3">Extended study with breaks</p>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">45 min</Badge>
                <Badge variant="outline" className="text-xs">15 min break</Badge>
                <Badge variant="outline" className="text-xs">30 min review</Badge>
              </div>
            </div>

            <div 
              className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => loadTemplate("quick-review")}
            >
              <h4 className="font-medium mb-2">Quick Review</h4>
              <p className="text-sm text-muted-foreground mb-3">Spaced repetition focused</p>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">10 min review</Badge>
                <Badge variant="outline" className="text-xs">5 min break</Badge>
                <Badge variant="outline" className="text-xs">10 min practice</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}