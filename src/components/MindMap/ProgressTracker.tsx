import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, TrendingUp, Target } from 'lucide-react';

interface ProgressData {
  mapsCreated: number;
  nodesCreated: number;
  badges: string[];
}

export default function ProgressTracker() {
  const [progress, setProgress] = useState<ProgressData>({
    mapsCreated: 0,
    nodesCreated: 0,
    badges: [],
  });

  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('mindMapProgress') || '{}');
    setProgress({
      mapsCreated: savedProgress.mapsCreated || 0,
      nodesCreated: savedProgress.nodesCreated || 0,
      badges: savedProgress.badges || [],
    });
  }, []);

  const badges = [
    { id: 'starter', name: 'Map Starter', requirement: 1, icon: '🌱' },
    { id: 'explorer', name: 'Mind Explorer', requirement: 5, icon: '🗺️' },
    { id: 'master', name: 'Map Master', requirement: 10, icon: '🏆' },
  ];

  const earnedBadges = badges.filter((badge) => progress.mapsCreated >= badge.requirement);
  const nextBadge = badges.find((badge) => progress.mapsCreated < badge.requirement);

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gradient-subtle">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Your Progress</h3>
            <p className="text-sm text-muted-foreground">Keep building amazing maps!</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Maps Created</span>
              <span className="font-semibold">{progress.mapsCreated}</span>
            </div>
            <Progress value={(progress.mapsCreated / 10) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Nodes Created</span>
              <span className="font-semibold">{progress.nodesCreated}</span>
            </div>
            <Progress value={(progress.nodesCreated / 50) * 100} className="h-2" />
          </div>
        </div>
      </Card>

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Badges Earned
        </h3>
        <div className="space-y-2">
          {earnedBadges.map((badge) => (
            <Card key={badge.id} className="p-3 bg-gradient-success">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-success-foreground">{badge.name}</div>
                  <div className="text-xs text-success-foreground/80">Unlocked!</div>
                </div>
                <Badge variant="secondary">✓</Badge>
              </div>
            </Card>
          ))}

          {nextBadge && (
            <Card className="p-3 border-dashed">
              <div className="flex items-center gap-3">
                <span className="text-2xl opacity-50">{nextBadge.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold">{nextBadge.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Create {nextBadge.requirement - progress.mapsCreated} more map(s)
                  </div>
                </div>
                <Badge variant="outline">
                  <Target className="h-3 w-3" />
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
