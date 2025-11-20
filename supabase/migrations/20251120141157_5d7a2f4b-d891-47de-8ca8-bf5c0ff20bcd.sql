-- Create user_stats table for tracking study time and streaks
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_streak INTEGER NOT NULL DEFAULT 0,
  total_study_time NUMERIC NOT NULL DEFAULT 0,
  last_update_time TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users can only view their own stats
CREATE POLICY "Users can view their own stats"
  ON public.user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert their own stats"
  ON public.user_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update their own stats"
  ON public.user_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update study time and calculate streak properly
-- Streak = floor(total_study_time / 24)
CREATE OR REPLACE FUNCTION public.update_study_time(
  user_uuid UUID,
  hours_to_add NUMERIC
)
RETURNS TABLE (
  study_streak INTEGER,
  total_study_time NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total NUMERIC;
  new_streak INTEGER;
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (user_id, total_study_time, study_streak, last_update_time, updated_at)
  VALUES (
    user_uuid,
    hours_to_add,
    FLOOR(hours_to_add / 24)::INTEGER,
    now(),
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_study_time = user_stats.total_study_time + hours_to_add,
    study_streak = FLOOR((user_stats.total_study_time + hours_to_add) / 24)::INTEGER,
    last_update_time = now(),
    updated_at = now()
  RETURNING user_stats.total_study_time, user_stats.study_streak
  INTO new_total, new_streak;

  RETURN QUERY SELECT new_streak, new_total;
END;
$$;

-- Function to get or create user stats
CREATE OR REPLACE FUNCTION public.get_or_create_user_stats(
  user_uuid UUID
)
RETURNS TABLE (
  study_streak INTEGER,
  total_study_time NUMERIC,
  last_update_time TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert if not exists
  INSERT INTO public.user_stats (user_id, study_streak, total_study_time)
  VALUES (user_uuid, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Return the stats
  RETURN QUERY
  SELECT us.study_streak, us.total_study_time, us.last_update_time
  FROM public.user_stats us
  WHERE us.user_id = user_uuid;
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();