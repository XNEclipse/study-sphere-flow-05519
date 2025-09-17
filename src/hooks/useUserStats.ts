import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  study_streak: number;
  total_study_time: number;
  last_login_date: string | null;
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStats({
          study_streak: data.study_streak,
          total_study_time: data.total_study_time,
          last_login_date: data.last_login_date,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLoginStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('update_study_streak', {
        user_uuid: user.id
      });

      if (error) throw error;
      
      // Refetch stats after update
      await fetchStats();
    } catch (error) {
      console.error('Error updating login streak:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update login streak"
      });
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

      if (error) throw error;
      
      // Refetch stats after update
      await fetchStats();
      
      toast({
        title: "Session Complete!",
        description: `Added ${durationHours} hours to your study time.`
      });
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record session completion"
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    updateLoginStreak,
    completeSession,
    refetch: fetchStats
  };
}