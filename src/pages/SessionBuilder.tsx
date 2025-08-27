import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Save
} from "lucide-react";

const availableSteps = [
  { id: "pomodoro", name: "Pomodoro Block", icon: Timer, duration: "25 min", color: "bg-red-100 text-red-700" },
  { id: "active-recall", name: "Active Recall", icon: Brain, duration: "15 min", color: "bg-blue-100 text-blue-700" },
  { id: "review", name: "Spaced Review", icon: RotateCcw, duration: "10 min", color: "bg-green-100 text-green-700" },
  { id: "notes", name: "Note Summary", icon: FileText, duration: "20 min", color: "bg-purple-100 text-purple-700" },
  { id: "break", name: "Break", icon: Coffee, duration: "5 min", color: "bg-yellow-100 text-yellow-700" }
];

export default function SessionBuilder() {
  const [sessionSteps, setSessionSteps] = useState([
    { id: "1", type: "pomodoro", name: "Pomodoro Block", duration: "25 min", customDuration: 25 },
    { id: "2", type: "break", name: "Short Break", duration: "5 min", customDuration: 5 }
  ]);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-focus bg-clip-text text-transparent">
          Study Session Builder
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Design your perfect study flow by combining proven techniques. Drag, drop, and customize!
        </p>
      </div>

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
                <Button variant="hero" size="sm" disabled={sessionSteps.length === 0}>
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
            <div className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <h4 className="font-medium mb-2">Focus Flow</h4>
              <p className="text-sm text-muted-foreground mb-3">Pomodoro + Active Recall</p>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">25 min</Badge>
                <Badge variant="outline" className="text-xs">5 min break</Badge>
                <Badge variant="outline" className="text-xs">15 min recall</Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <h4 className="font-medium mb-2">Deep Dive</h4>
              <p className="text-sm text-muted-foreground mb-3">Extended study with breaks</p>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">45 min</Badge>
                <Badge variant="outline" className="text-xs">15 min break</Badge>
                <Badge variant="outline" className="text-xs">30 min review</Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
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