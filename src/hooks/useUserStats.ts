import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  study_streak: number;
  total_study_time: number;
  last_update_time: string | null;
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_or_create_user_stats', {
        user_uuid: user.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats({
          study_streak: data[0].study_streak,
          total_study_time: parseFloat(data[0].total_study_time.toString()),
          last_update_time: data[0].last_update_time,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudyTime = async (hoursToAdd: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('update_study_time', {
        user_uuid: user.id,
        hours_to_add: hoursToAdd
      });

      if (error) throw error;
      
      // Update local state with new values
      if (data && data.length > 0) {
        setStats({
          study_streak: data[0].study_streak,
          total_study_time: parseFloat(data[0].total_study_time.toString()),
          last_update_time: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error adding study time:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update study time"
      });
    }
  };


  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    addStudyTime,
    refetch: fetchStats
  };
}