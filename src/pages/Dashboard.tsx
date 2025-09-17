import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, 
  Clock, 
  Target, 
  BookOpen, 
  Timer,
  Layers3,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";

export default function Dashboard() {
  const { stats, loading } = useUserStats();
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
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-success">
                  {stats?.study_streak || 0} days
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.study_streak === 0 
                    ? "Start your journey today!" 
                    : "Keep it up! You're building momentum."}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-soft hover:shadow-focus transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">
                  {stats?.total_study_time || 0} hrs
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.total_study_time === 0 
                    ? "Complete your first session!" 
                    : "Great progress on your learning journey"}
                </p>
              </>
            )}
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
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div>
                <p className="font-medium">Feynman Technique - Physics</p>
                <p className="text-sm text-muted-foreground">25 min • 2 hours ago</p>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div>
                <p className="font-medium">Pomodoro - Math Review</p>
                <p className="text-sm text-muted-foreground">45 min • Yesterday</p>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/sessions">View All Sessions</Link>
            </Button>
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
            <span className="text-sm text-muted-foreground">3/5 tasks completed</span>
          </div>
          <Progress value={60} className="h-2" />
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Review Chemistry flashcards (Spaced Rep)</span>
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full ml-auto">Done</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Pomodoro session - Math problems</span>
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full ml-auto">Done</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">Feynman Technique - Explain photosynthesis</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full ml-auto">Next</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}