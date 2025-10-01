import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Save, Play } from "lucide-react";
import { toast } from "sonner";

interface Card {
  id: string;
  term: string;
  definition: string;
  position: number;
  term_image_url?: string | null;
  definition_image_url?: string | null;
}

export default function FlashcardEditor() {
  const navigate = useNavigate();
  const { setId } = useParams();
  const isEditing = Boolean(setId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<Card[]>([
    { id: crypto.randomUUID(), term: "", definition: "", position: 0 },
    { id: crypto.randomUUID(), term: "", definition: "", position: 1 },
  ]);
  const [saving, setSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isEditing) {
      loadSet();
    }
  }, [setId]);

  useEffect(() => {
    // Auto-save to localStorage
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    
    const timeout = setTimeout(() => {
      localStorage.setItem("flashcard_draft", JSON.stringify({ title, description, cards }));
    }, 1000);
    
    setAutoSaveTimeout(timeout);
    
    return () => {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    };
  }, [title, description, cards]);

  const loadSet = async () => {
    if (!setId) return;

    try {
      const { data: setData, error: setError } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("id", setId)
        .single();

      if (setError) throw setError;

      const { data: cardsData, error: cardsError } = await supabase
        .from("flashcard_cards")
        .select("*")
        .eq("set_id", setId)
        .order("position");

      if (cardsError) throw cardsError;

      setTitle(setData.title);
      setDescription(setData.description || "");
      setCards(cardsData.map((c) => ({ ...c, id: c.id })));
    } catch (error: any) {
      console.error("Error loading set:", error);
      toast.error("Failed to load flashcard set");
    }
  };

  const addCard = () => {
    const newCard: Card = {
      id: crypto.randomUUID(),
      term: "",
      definition: "",
      position: cards.length,
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (id: string) => {
    if (cards.length <= 1) {
      toast.error("You must have at least one card");
      return;
    }
    setCards(cards.filter((c) => c.id !== id).map((c, idx) => ({ ...c, position: idx })));
    toast.success("Card deleted");
  };

  const updateCard = (id: string, field: "term" | "definition", value: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const moveCard = (index: number, direction: "up" | "down") => {
    const newCards = [...cards];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newCards.length) return;
    
    [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];
    setCards(newCards.map((c, idx) => ({ ...c, position: idx })));
  };

  const validateSet = (): boolean => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return false;
    }
    
    if (title.length > 120) {
      toast.error("Title must be less than 120 characters");
      return false;
    }
    
    const validCards = cards.filter((c) => c.term.trim() || c.definition.trim());
    if (validCards.length === 0) {
      toast.error("Please add at least one card with a term or definition");
      return false;
    }
    
    return true;
  };

  const saveSet = async (andPractice: boolean = false) => {
    if (!validateSet()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const validCards = cards.filter((c) => c.term.trim() || c.definition.trim());

      let currentSetId = setId;

      if (isEditing) {
        // Update existing set
        const { error: setError } = await supabase
          .from("flashcard_sets")
          .update({ title, description })
          .eq("id", setId);

        if (setError) throw setError;

        // Delete existing cards and insert new ones
        const { error: deleteError } = await supabase
          .from("flashcard_cards")
          .delete()
          .eq("set_id", setId);

        if (deleteError) throw deleteError;
      } else {
        // Create new set
        const { data: newSet, error: setError } = await supabase
          .from("flashcard_sets")
          .insert({ title, description, user_id: user.id })
          .select()
          .single();

        if (setError) throw setError;
        currentSetId = newSet.id;
      }

      // Insert cards
      const { error: cardsError } = await supabase
        .from("flashcard_cards")
        .insert(
          validCards.map((c) => ({
            set_id: currentSetId,
            term: c.term.trim(),
            definition: c.definition.trim(),
            position: c.position,
          }))
        );

      if (cardsError) throw cardsError;

      localStorage.removeItem("flashcard_draft");
      toast.success("Flashcard set saved", {
        action: andPractice ? undefined : {
          label: "Study",
          onClick: () => navigate(`/flashcards/${currentSetId}/study`),
        },
      });

      if (andPractice) {
        navigate(`/flashcards/${currentSetId}/study`);
      } else {
        navigate("/flashcards");
      }
    } catch (error: any) {
      console.error("Error saving set:", error);
      toast.error("Failed to save flashcard set");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Flashcards / {isEditing ? "Edit Set" : "New Set"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => saveSet(false)}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Create"}
            </Button>
            <Button
              onClick={() => saveSet(true)}
              disabled={saving}
            >
              <Play className="mr-2 h-4 w-4" />
              Create and practice
            </Button>
          </div>
        </div>

        <Input
          placeholder="Enter a title (required, max 120 characters)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="mb-3 text-2xl font-bold h-auto py-3"
        />
        
        <Textarea
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-6"
          rows={2}
        />
      </div>

      <div className="space-y-4 mb-6">
        {cards.map((card, index) => (
          <Card key={card.id} className="relative">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveCard(index, "up")}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Term
                    </label>
                    <Textarea
                      placeholder="Enter term"
                      value={card.term}
                      onChange={(e) => updateCard(card.id, "term", e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Definition
                    </label>
                    <Textarea
                      placeholder="Enter definition"
                      value={card.definition}
                      onChange={(e) => updateCard(card.id, "definition", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addCard} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add a card
      </Button>
    </div>
  );
}
