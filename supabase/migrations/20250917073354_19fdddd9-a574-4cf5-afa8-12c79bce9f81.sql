-- Create user_stats table to track study metrics
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  study_streak INTEGER NOT NULL DEFAULT 0,
  total_study_time DECIMAL NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_stats UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for user stats access
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create study_sessions table to track completed sessions
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_name TEXT,
  duration_hours DECIMAL NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for study sessions
CREATE POLICY "Users can view their own sessions" 
ON public.study_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.study_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize user stats when a user is created
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, study_streak, total_study_time, last_login_date)
  VALUES (NEW.id, 0, 0, CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create user stats when user signs up
CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_stats();

-- Function to update study streak on login
CREATE OR REPLACE FUNCTION public.update_study_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_stats RECORD;
  days_since_last_login INTEGER;
BEGIN
  -- Get current user stats
  SELECT * INTO current_stats 
  FROM public.user_stats 
  WHERE user_id = user_uuid;
  
  IF current_stats IS NOT NULL THEN
    -- Calculate days since last login
    days_since_last_login := CURRENT_DATE - current_stats.last_login_date;
    
    IF days_since_last_login = 1 THEN
      -- Consecutive day: increment streak
      UPDATE public.user_stats 
      SET study_streak = study_streak + 1,
          last_login_date = CURRENT_DATE,
          updated_at = now()
      WHERE user_id = user_uuid;
    ELSIF days_since_last_login > 1 THEN
      -- Missed days: reset streak to 1
      UPDATE public.user_stats 
      SET study_streak = 1,
          last_login_date = CURRENT_DATE,
          updated_at = now()
      WHERE user_id = user_uuid;
    ELSE
      -- Same day: just update last login
      UPDATE public.user_stats 
      SET last_login_date = CURRENT_DATE,
          updated_at = now()
      WHERE user_id = user_uuid;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to add completed session and update total study time
CREATE OR REPLACE FUNCTION public.complete_study_session(
  user_uuid UUID, 
  session_name_param TEXT, 
  duration_hours_param DECIMAL
)
RETURNS VOID AS $$
BEGIN
  -- Insert the completed session
  INSERT INTO public.study_sessions (user_id, session_name, duration_hours)
  VALUES (user_uuid, session_name_param, duration_hours_param);
  
  -- Update total study time
  UPDATE public.user_stats 
  SET total_study_time = total_study_time + duration_hours_param,
      updated_at = now()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;