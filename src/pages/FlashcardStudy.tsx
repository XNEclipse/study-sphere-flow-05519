import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface StudyCard {
  id: string;
  term: string;
  definition: string;
  term_image_url?: string | null;
  definition_image_url?: string | null;
}

interface StudyProgress {
  id?: string;
  ease_factor: number;
  repetition: number;
  interval: number;
  next_review: string;
}

export default function FlashcardStudy() {
  const navigate = useNavigate();
  const { setId } = useParams();
  
  const [setTitle, setSetTitle] = useState("");
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);

  useEffect(() => {
    loadStudySession();
  }, [setId]);

  const loadStudySession = async () => {
    if (!setId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Load set info
      const { data: setData, error: setError } = await supabase
        .from("flashcard_sets")
        .select("title")
        .eq("id", setId)
        .single();

      if (setError) throw setError;
      setSetTitle(setData.title);

      // Load all cards
      const { data: cardsData, error: cardsError } = await supabase
        .from("flashcard_cards")
        .select("*")
        .eq("set_id", setId)
        .order("position");

      if (cardsError) throw cardsError;

      if (!cardsData || cardsData.length === 0) {
        toast.error("No cards found in this set");
        navigate("/flashcards");
        return;
      }

      setCards(cardsData);
    } catch (error: any) {
      console.error("Error loading study session:", error);
      toast.error("Failed to load study session");
      navigate("/flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const calculateNextReview = (rating: number, progress?: StudyProgress) => {
    const today = new Date();
    let easeFactor = progress?.ease_factor || 2.5;
    let repetition = progress?.repetition || 0;
    let interval = progress?.interval || 0;

    if (rating < 3) {
      // Again or Hard (for ratings 0-2)
      repetition = 0;
      interval = 1;
    } else {
      // Good or Easy (ratings 3-5)
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition += 1;
    }

    // Adjust ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * 0.08));

    const nextReview = new Date(today);
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ease_factor: easeFactor,
      repetition,
      interval,
      next_review: nextReview.toISOString().split("T")[0],
    };
  };

  const handleRating = async (rating: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentCard = cards[currentIndex];

      // Get existing progress
      const { data: existingProgress } = await supabase
        .from("study_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("card_id", currentCard.id)
        .maybeSingle();

      const newProgress = calculateNextReview(rating, existingProgress || undefined);

      // Upsert progress
      const { error: progressError } = await supabase
        .from("study_progress")
        .upsert({
          user_id: user.id,
          card_id: currentCard.id,
          ...newProgress,
        });

      if (progressError) throw progressError;

      setStudiedCount(studiedCount + 1);

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setSessionComplete(true);
      }
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (sessionComplete) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === "1") handleRating(0); // Again
        else if (e.key === "2") handleRating(3); // Hard
        else if (e.key === "3") handleRating(4); // Good
        else if (e.key === "4") handleRating(5); // Easy
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, sessionComplete, currentIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading study session...</div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="p-12 text-center">
          <CardContent>
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground mb-6">
                You studied {studiedCount} cards from "{setTitle}"
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/flashcards")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setSessionComplete(false);
                setStudiedCount(0);
              }}>
                <RotateCw className="mr-2 h-4 w-4" />
                Study Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/flashcards")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{setTitle}</h1>
          <span className="text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex flex-col items-center gap-6">
        <Card 
          className="w-full max-w-2xl min-h-[400px] cursor-pointer hover:shadow-lg transition-all"
          onClick={handleFlip}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] p-12 text-center">
            {!isFlipped ? (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-4">TERM</div>
                <div className="text-3xl font-bold">{currentCard.term}</div>
                <div className="mt-8 text-sm text-muted-foreground">
                  Click or press <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to flip
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-4">DEFINITION</div>
                <div className="text-2xl">{currentCard.definition}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {isFlipped && (
          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              variant="destructive"
              onClick={() => handleRating(0)}
              className="min-w-[100px]"
            >
              Again
              <kbd className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">1</kbd>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRating(3)}
              className="min-w-[100px]"
            >
              Hard
              <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs">2</kbd>
            </Button>
            <Button
              variant="default"
              onClick={() => handleRating(4)}
              className="min-w-[100px]"
            >
              Good
              <kbd className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">3</kbd>
            </Button>
            <Button
              variant="success"
              onClick={() => handleRating(5)}
              className="min-w-[100px]"
            >
              Easy
              <kbd className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">4</kbd>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
