-- Create flashcard_folders table
CREATE TABLE public.flashcard_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcard_sets table
CREATE TABLE public.flashcard_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.flashcard_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcard_cards table
CREATE TABLE public.flashcard_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  term_image_url TEXT,
  definition_image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_progress table
CREATE TABLE public.study_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.flashcard_cards(id) ON DELETE CASCADE,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  repetition INTEGER NOT NULL DEFAULT 0,
  interval INTEGER NOT NULL DEFAULT 0,
  next_review DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Enable RLS
ALTER TABLE public.flashcard_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flashcard_folders
CREATE POLICY "Users can view their own folders"
  ON public.flashcard_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON public.flashcard_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON public.flashcard_folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON public.flashcard_folders FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for flashcard_sets
CREATE POLICY "Users can view their own sets"
  ON public.flashcard_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sets"
  ON public.flashcard_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sets"
  ON public.flashcard_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sets"
  ON public.flashcard_sets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for flashcard_cards
CREATE POLICY "Users can view cards in their sets"
  ON public.flashcard_cards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.flashcard_sets
    WHERE flashcard_sets.id = flashcard_cards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create cards in their sets"
  ON public.flashcard_cards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.flashcard_sets
    WHERE flashcard_sets.id = flashcard_cards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update cards in their sets"
  ON public.flashcard_cards FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.flashcard_sets
    WHERE flashcard_sets.id = flashcard_cards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete cards in their sets"
  ON public.flashcard_cards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.flashcard_sets
    WHERE flashcard_sets.id = flashcard_cards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

-- RLS Policies for study_progress
CREATE POLICY "Users can view their own progress"
  ON public.study_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.study_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.study_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.study_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_flashcard_folders_updated_at
  BEFORE UPDATE ON public.flashcard_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcard_sets_updated_at
  BEFORE UPDATE ON public.flashcard_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcard_cards_updated_at
  BEFORE UPDATE ON public.flashcard_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_progress_updated_at
  BEFORE UPDATE ON public.study_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_flashcard_sets_user_id ON public.flashcard_sets(user_id);
CREATE INDEX idx_flashcard_sets_folder_id ON public.flashcard_sets(folder_id);
CREATE INDEX idx_flashcard_cards_set_id ON public.flashcard_cards(set_id);
CREATE INDEX idx_flashcard_cards_position ON public.flashcard_cards(set_id, position);
CREATE INDEX idx_study_progress_user_card ON public.study_progress(user_id, card_id);
CREATE INDEX idx_study_progress_next_review ON public.study_progress(user_id, next_review);