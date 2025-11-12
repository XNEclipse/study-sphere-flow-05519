import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PlayCircle, 
  Clock, 
  Target, 
  BookOpen, 
  Timer,
  Layers3,
  Calendar,
  ChevronRight,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";
import { useState, useEffect } from "react";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export default function Dashboard() {
  const { stats, loading } = useUserStats();
  
  // Study Streak & Total Study Time
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  
  // Today's Focus Goals
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  
  // Initialize counters and goals on mount
  useEffect(() => {
    // Study Streak - increment on login
    const lastLoginDate = localStorage.getItem("lastLoginDate");
    const today = new Date().toDateString();
    const currentStreak = parseInt(localStorage.getItem("studyStreak") || "0");
    
    if (lastLoginDate !== today) {
      const newStreak = currentStreak + 1;
      setStudyStreak(newStreak);
      localStorage.setItem("studyStreak", newStreak.toString());
      localStorage.setItem("lastLoginDate", today);
    } else {
      setStudyStreak(currentStreak);
    }
    
    // Total Study Time - load and start timer
    const savedTime = parseFloat(localStorage.getItem("totalStudyHours") || "0");
    setTotalStudyTime(savedTime);
    
    // Load today's goals
    const savedGoals = localStorage.getItem("todayGoals");
    const tomorrowGoals = localStorage.getItem("tomorrowGoals");
    const lastGoalDate = localStorage.getItem("lastGoalDate");
    
    if (lastGoalDate !== today && tomorrowGoals) {
      // New day - load tomorrow's goals as today's
      const parsedTomorrowGoals = JSON.parse(tomorrowGoals).map((g: Goal) => ({
        ...g,
        completed: false
      }));
      setGoals(parsedTomorrowGoals);
      localStorage.setItem("todayGoals", JSON.stringify(parsedTomorrowGoals));
      localStorage.removeItem("tomorrowGoals");
      localStorage.setItem("lastGoalDate", today);
    } else if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    
    if (!lastGoalDate) {
      localStorage.setItem("lastGoalDate", today);
    }
  }, []);
  
  // Study Time Timer - increment every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalStudyTime(prev => {
        const newTime = prev + 1;
        localStorage.setItem("totalStudyHours", newTime.toString());
        return newTime;
      });
    }, 3 * 60 * 1000); // 3 minutes in milliseconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem("todayGoals", JSON.stringify(goals));
    }
  }, [goals]);
  
  // Add new goal
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        text: newGoal.trim(),
        completed: false
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal("");
    }
  };
  
  // Toggle goal completion
  const handleToggleGoal = (id: string) => {
    setGoals(prev => 
      prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    );
  };
  
  // Save goal for tomorrow
  const handleSaveForTomorrow = (id: string) => {
    const goalToSave = goals.find(g => g.id === id);
    if (goalToSave) {
      const tomorrowGoals = JSON.parse(localStorage.getItem("tomorrowGoals") || "[]");
      tomorrowGoals.push(goalToSave);
      localStorage.setItem("tomorrowGoals", JSON.stringify(tomorrowGoals));
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };
  
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-primary-foreground shadow-glow">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Scholar!</h1>
          <p className="text-lg text-primary-foreground/90 mb-6">
            Ready to unlock your learning potential? Let's dive in.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="energy" size="lg" asChild>
              <Link to="/builder">
                <PlayCircle className="mr-2" />
                Start Study Session
              </Link>
            </Button>
            
            <Button variant="success" size="lg" asChild>
              <Link to="/tools">
                <Timer className="mr-2" />
                Pomodoro Timer
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-soft hover:shadow-focus transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {studyStreak} {studyStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-xs text-muted-foreground">
              Keep it up! You're building momentum.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-soft hover:shadow-focus transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalStudyTime.toFixed(1)} hrs
            </div>
            <p className="text-xs text-muted-foreground">
              Track your learning progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Sessions
            </CardTitle>
            <CardDescription>
              Pick up where you left off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const sessions = JSON.parse(localStorage.getItem("recentSessions") || "[]");
              const recentFive = sessions.slice(0, 5);

              const getTimeAgo = (timestamp: number) => {
                const now = Date.now();
                const diff = now - timestamp;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                
                if (hours < 1) return "Just now";
                if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                if (days === 1) return "Yesterday";
                return `${days} days ago`;
              };

              if (recentFive.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions yet</p>
                    <p className="text-xs mt-1">Start a session to see it here!</p>
                  </div>
                );
              }

              return recentFive.map((session: any) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => {
                    // Preload session steps
                    localStorage.setItem("preloadSession", JSON.stringify(session));
                    window.location.href = "/builder";
                  }}
                >
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.duration} min • {getTimeAgo(session.completedAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ));
            })()}
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Jump into your favorite study tools
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/library">
                <BookOpen className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm">Study Library</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/builder">
                <Layers3 className="h-6 w-6 mb-2 text-secondary" />
                <span className="text-sm">Session Builder</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/tools">
                <Timer className="h-6 w-6 mb-2 text-accent" />
                <span className="text-sm">Timer & Tools</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link to="/scheduler">
                <Calendar className="h-6 w-6 mb-2 text-success" />
                <span className="text-sm">Smart Scheduler</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Focus */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Today's Focus</CardTitle>
          <CardDescription>
            Your personalized study plan for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Daily Progress</span>
            <span className="text-sm text-muted-foreground">
              Total Tasks Completed: {completedGoals}/{totalGoals}
            </span>
          </div>
          <Progress value={totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0} className="h-2" />
          
          {/* Add Goal Input */}
          <div className="flex gap-2 pt-2">
            <Input 
              placeholder="Type a new goal for today..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
              className="flex-1"
            />
            <Button onClick={handleAddGoal} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </div>
          
          {/* Goals List */}
          <div className="space-y-3 mt-4">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No goals yet. Add your first goal to get started!
              </div>
            ) : (
              goals.map((goal) => (
                <div 
                  key={goal.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    goal.completed 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-muted/50 border-border/50'
                  }`}
                >
                  <Checkbox 
                    checked={goal.completed}
                    onCheckedChange={() => handleToggleGoal(goal.id)}
                    className="mt-0.5"
                  />
                  <span 
                    className={`text-sm flex-1 ${
                      goal.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {goal.text}
                  </span>
                  {goal.completed && (
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                      Done
                    </span>
                  )}
                  {!goal.completed && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSaveForTomorrow(goal.id)}
                      className="text-xs"
                    >
                      Save for Tomorrow
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          
          {totalGoals > 0 && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
              Total Tasks Today: {totalGoals}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Where You Left Off */}
      {JSON.parse(localStorage.getItem("tomorrowGoals") || "[]").length > 0 && (
        <Card className="shadow-soft border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-accent" />
              Continue Where You Left Off!
            </CardTitle>
            <CardDescription>
              Tasks saved for tomorrow - bring them back to today's focus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {JSON.parse(localStorage.getItem("tomorrowGoals") || "[]").map((goal: Goal) => (
              <div 
                key={goal.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20"
              >
                <span className="text-sm flex-1">
                  {goal.text}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const tomorrowGoals = JSON.parse(localStorage.getItem("tomorrowGoals") || "[]");
                    const updatedTomorrowGoals = tomorrowGoals.filter((g: Goal) => g.id !== goal.id);
                    localStorage.setItem("tomorrowGoals", JSON.stringify(updatedTomorrowGoals));
                    setGoals(prev => [...prev, { ...goal, completed: false }]);
                  }}
                  className="text-xs"
                >
                  Return to Today's Focus
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}