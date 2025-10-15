import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import CornellNotes from "@/components/CornellNotes";
import MindMapWorkspace from "@/components/MindMap/MindMapWorkspace";
import WhiteboardCanvas from "@/components/Whiteboard/WhiteboardCanvas";
import {
  Timer, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Brain,
  Lightbulb,
  Layers,
  Mic,
  MicOff
} from "lucide-react";

export default function Tools() {
  const navigate = useNavigate();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      // Timer finished logic
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  if (showMindMap) {
    return <MindMapWorkspace onClose={() => setShowMindMap(false)} />;
  }

  if (showWhiteboard) {
    return <WhiteboardCanvas onClose={() => setShowWhiteboard(false)} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-energy bg-clip-text text-transparent">
          Study Tools & Utilities
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Powerful tools to enhance your learning experience. Focus, create, and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pomodoro Timer */}
        <Card className="shadow-focus border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Timer className="h-6 w-6 text-primary-foreground" />
              </div>
              Pomodoro Timer
              <Badge variant={isBreak ? "secondary" : "default"}>
                {isBreak ? "Break" : "Focus"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Stay focused with the proven 25-minute technique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div className="text-6xl font-bold font-mono text-primary mb-4">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                {isTimerRunning ? "Focus time! Stay concentrated." : "Ready when you are."}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-3">
              <Button
                variant={isTimerRunning ? "outline" : "hero"}
                size="lg"
                onClick={isTimerRunning ? pauseTimer : startTimer}
              >
                {isTimerRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                {isTimerRunning ? "Pause" : "Start"}
              </Button>
              
              <Button variant="outline" size="lg" onClick={resetTimer}>
                <Square className="h-5 w-5 mr-2" />
                Reset
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            {/* Quick Settings */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <Button variant="outline" size="sm" onClick={() => setTimeLeft(25 * 60)}>
                25 min
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeLeft(5 * 60)}>
                5 min
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeLeft(15 * 60)}>
                15 min
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Blurting Tool */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-success rounded-lg">
                <Mic className="h-6 w-6 text-success-foreground" />
              </div>
              Voice Blurting
            </CardTitle>
            <CardDescription>
              Speak your thoughts to identify knowledge gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                isRecording ? "bg-red-100 border-4 border-red-300 animate-pulse" : "bg-muted"
              }`}>
                {isRecording ? (
                  <MicOff className="h-12 w-12 text-red-600" />
                ) : (
                  <Mic className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {isRecording 
                  ? "Recording... Explain the topic in your own words" 
                  : "Click to start recording your explanation"
                }
              </p>

              <Button
                variant={isRecording ? "destructive" : "success"}
                size="lg"
                onClick={toggleRecording}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
            </div>

            {/* Transcript Area */}
            <div className="bg-muted/50 rounded-lg p-4 min-h-[100px] border border-border">
              <p className="text-sm text-muted-foreground italic">
                {isRecording 
                  ? "Your words will appear here as you speak..."
                  : "Click 'Start Recording' to begin voice-to-text capture"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Other Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Flashcards */}
        <Card className="shadow-soft hover:shadow-focus transition-all cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-gradient-focus rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Layers className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Flashcards</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create and study with spaced repetition
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/flashcards")}>
              Open Flashcards
            </Button>
          </CardContent>
        </Card>

        {/* Mind Map */}
        <Card className="shadow-soft hover:shadow-focus transition-all cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-gradient-primary rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Mind Maps</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Visualize connections between concepts
            </p>
            <Button variant="outline" className="w-full" onClick={() => setShowMindMap(true)}>
              Create Mind Map
            </Button>
          </CardContent>
        </Card>

        {/* Cornell Notes */}
        <CornellNotes />

        {/* Digital Whiteboard */}
        <Card className="shadow-soft hover:shadow-focus transition-all cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-gradient-energy rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Lightbulb className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Whiteboard</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Draw and explain concepts visually
            </p>
            <Button variant="outline" className="w-full" onClick={() => setShowWhiteboard(true)}>
              Open Whiteboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-subtle shadow-soft">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Need to save your progress?</h3>
          <p className="text-muted-foreground mb-6">
            Connect to Supabase to automatically save all your study sessions, notes, and progress.
          </p>
          <Button variant="hero" size="lg">
            Connect Backend for Full Features
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
