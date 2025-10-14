import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Plus, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CornellNote {
  id: string;
  title: string;
  cues: string;
  notes: string;
  summary: string;
  date: string;
}

export default function CornellNotes() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedNotes, setSavedNotes] = useState<CornellNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [cues, setCues] = useState("");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");

  // Load saved notes on mount
  useEffect(() => {
    const saved = localStorage.getItem("savedNotes");
    if (saved) {
      setSavedNotes(JSON.parse(saved));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (savedNotes.length > 0) {
      localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
    }
  }, [savedNotes]);

  const handleSaveNote = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title for your note.",
        variant: "destructive"
      });
      return;
    }

    const noteData: CornellNote = {
      id: editingNoteId || Date.now().toString(),
      title: title.trim(),
      cues: cues.trim(),
      notes: notes.trim(),
      summary: summary.trim(),
      date: new Date().toLocaleDateString()
    };

    if (editingNoteId) {
      setSavedNotes(prev => prev.map(n => n.id === editingNoteId ? noteData : n));
      toast({
        title: "Note updated",
        description: "Your Cornell note has been updated successfully."
      });
    } else {
      setSavedNotes(prev => [...prev, noteData]);
      toast({
        title: "Note saved",
        description: "Your Cornell note has been saved successfully."
      });
    }

    handleCloseDialog();
  };

  const handleOpenNote = (note: CornellNote) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setCues(note.cues);
    setNotes(note.notes);
    setSummary(note.summary);
    setIsDialogOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes(prev => prev.filter(n => n.id !== id));
    localStorage.setItem("savedNotes", JSON.stringify(savedNotes.filter(n => n.id !== id)));
    toast({
      title: "Note deleted",
      description: "Your Cornell note has been deleted."
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingNoteId(null);
    setTitle("");
    setCues("");
    setNotes("");
    setSummary("");
  };

  return (
    <>
      <Card className="shadow-soft hover:shadow-focus transition-all cursor-pointer group">
        <CardContent className="p-6 text-center">
          <div className="p-4 bg-gradient-success rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FileText className="h-8 w-8 text-success-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Cornell Notes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Structured note-taking template
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsDialogOpen(true)}
          >
            Start Taking Notes
          </Button>
        </CardContent>
      </Card>

      {/* Cornell Notes Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNoteId ? "Edit Cornell Note" : "Create Cornell Note"}
            </DialogTitle>
            <DialogDescription>
              Use the Cornell method to organize your notes effectively
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input 
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Cornell Layout: Cues | Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cues Column */}
              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-1 block">Cues</label>
                <Textarea 
                  placeholder="Key questions, terms, prompts..."
                  value={cues}
                  onChange={(e) => setCues(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </div>

              {/* Notes Column */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Textarea 
                  placeholder="Main notes, detailed information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="text-sm font-medium mb-1 block">Summary</label>
              <Textarea 
                placeholder="Summarize the main ideas in your own words..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveNote}>
                Save Note
              </Button>
            </div>
          </div>

          {/* Your Notes Section */}
          {savedNotes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold mb-4">Your Notes</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {savedNotes.map((note) => (
                  <Card 
                    key={note.id}
                    className="hover:shadow-soft transition-all cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1" onClick={() => handleOpenNote(note)}>
                          <CardTitle className="text-base">{note.title}</CardTitle>
                          <CardDescription className="text-xs">{note.date}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {savedNotes.length === 0 && !editingNoteId && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No notes yet. Create your first Cornell note!
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
