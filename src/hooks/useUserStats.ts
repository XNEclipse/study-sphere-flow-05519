import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  study_streak: number;
  total_study_time: number;
  last_login_date: string | null;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_stats')
        .select('study_streak, total_study_time, last_login_date')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching stats:', error);
        return;
      }

      setStats(data || { study_streak: 0, total_study_time: 0, last_login_date: null });
    } catch (error) {
      console.error('Error in fetchStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreakOnLogin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('update_study_streak', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error updating streak:', error);
      } else {
        await fetchStats(); // Refresh stats after update
      }
    } catch (error) {
      console.error('Error in updateStreakOnLogin:', error);
    }
  };

  const completeSession = async (sessionName: string, durationHours: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('complete_study_session', {
        user_uuid: user.id,
        session_name_param: sessionName,
        duration_hours_param: durationHours
      });

      if (error) {
        console.error('Error completing session:', error);
        toast({
          title: "Error",
          description: "Failed to save study session",
          variant: "destructive",
        });
      } else {
        await fetchStats(); // Refresh stats after update
        toast({
          title: "Session Completed!",
          description: `Added ${durationHours} hours to your study time`,
        });
      }
    } catch (error) {
      console.error('Error in completeSession:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    updateStreakOnLogin,
    completeSession,
    refreshStats: fetchStats
  };
};