import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderPlus, BookOpen, Calendar } from "lucide-react";
import { toast } from "sonner";

interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  card_count: number;
  due_count: number;
}

export default function Flashcards() {
  const navigate = useNavigate();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all sets with card counts
      const { data: setsData, error: setsError } = await supabase
        .from("flashcard_sets")
        .select("id, title, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (setsError) throw setsError;

      // Get card counts for each set
      const setsWithCounts = await Promise.all(
        (setsData || []).map(async (set) => {
          const { count: cardCount } = await supabase
            .from("flashcard_cards")
            .select("*", { count: "exact", head: true })
            .eq("set_id", set.id);

          const { count: dueCount } = await supabase
            .from("study_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .lte("next_review", new Date().toISOString().split("T")[0])
            .in(
              "card_id",
              await supabase
                .from("flashcard_cards")
                .select("id")
                .eq("set_id", set.id)
                .then((res) => res.data?.map((c) => c.id) || [])
            );

          return {
            ...set,
            card_count: cardCount || 0,
            due_count: dueCount || 0,
          };
        })
      );

      setSets(setsWithCounts);
    } catch (error: any) {
      console.error("Error loading sets:", error);
      toast.error("Failed to load flashcard sets");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">Create and study flashcard sets with spaced repetition</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button onClick={() => navigate("/flashcards/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Set
          </Button>
        </div>
      </div>

      {sets.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No flashcard sets yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first set to begin studying with spaced repetition.
            </p>
            <Button onClick={() => navigate("/flashcards/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Set
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((set) => (
            <Card key={set.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">{set.title}</CardTitle>
                {set.description && (
                  <CardDescription className="line-clamp-2">{set.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{set.card_count} cards</span>
                  </div>
                  {set.due_count > 0 && (
                    <div className="flex items-center gap-1 text-primary">
                      <Calendar className="h-4 w-4" />
                      <span>{set.due_count} due</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/flashcards/${set.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/flashcards/${set.id}/study`)}
                  >
                    Study
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
