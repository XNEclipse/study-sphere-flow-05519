import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Timer, 
  RotateCcw, 
  Lightbulb, 
  FileText, 
  Target,
  Clock,
  Users,
  BookOpen
} from "lucide-react";

const studyTechniques = [
  {
    id: "feynman",
    name: "Feynman Technique",
    description: "Learn by explaining concepts in simple terms",
    icon: Lightbulb,
    difficulty: "Beginner",
    timeRequired: "15-30 min",
    bestFor: ["Complex Concepts", "Deep Understanding"],
    overview: "Named after physicist Richard Feynman, this technique involves explaining concepts in simple language to identify knowledge gaps.",
    whenToUse: "When you need to truly understand complex topics, not just memorize them.",
    whoFor: "Students who want deep comprehension and to identify weak spots in their knowledge."
  },
  {
    id: "pomodoro",
    name: "Pomodoro Technique",
    description: "Break work into focused 25-minute intervals",
    icon: Timer,
    difficulty: "Beginner",
    timeRequired: "25 min cycles",
    bestFor: ["Focus", "Time Management"],
    overview: "Work in 25-minute focused intervals followed by 5-minute breaks. After 4 cycles, take a longer break.",
    whenToUse: "When you struggle with focus, procrastination, or time management.",
    whoFor: "Anyone looking to improve productivity and maintain sustained attention."
  },
  {
    id: "spaced-repetition",
    name: "Spaced Repetition",
    description: "Review material at increasing intervals",
    icon: RotateCcw,
    difficulty: "Intermediate",
    timeRequired: "10-20 min daily",
    bestFor: ["Memorization", "Long-term Retention"],
    overview: "Review information at systematically increasing intervals to combat the forgetting curve.",
    whenToUse: "For memorizing facts, vocabulary, formulas, or any information you need to retain long-term.",
    whoFor: "Students preparing for exams or learning languages."
  },
  {
    id: "active-recall",
    name: "Active Recall",
    description: "Test yourself instead of passive re-reading",
    icon: Brain,
    difficulty: "Beginner",
    timeRequired: "Variable",
    bestFor: ["Memory", "Understanding"],
    overview: "Actively retrieve information from memory rather than passively reviewing notes.",
    whenToUse: "Instead of highlighting or re-reading notes. Use for any subject where you need to remember information.",
    whoFor: "Students who want to move beyond surface-level learning."
  },
  {
    id: "cornell-notes",
    name: "Cornell Note-Taking",
    description: "Structured note-taking system for better review",
    icon: FileText,
    difficulty: "Beginner",
    timeRequired: "During lectures",
    bestFor: ["Note-taking", "Review"],
    overview: "Divide your page into three sections: notes, cues, and summary for systematic review.",
    whenToUse: "During lectures, reading sessions, or when you need organized, reviewable notes.",
    whoFor: "Students attending lectures or reading textbooks."
  },
  {
    id: "mind-mapping",
    name: "Mind Mapping",
    description: "Visual representation of information and connections",
    icon: Target,
    difficulty: "Beginner",
    timeRequired: "20-45 min",
    bestFor: ["Visual Learning", "Connections"],
    overview: "Create visual diagrams showing relationships between concepts, starting from a central topic.",
    whenToUse: "For brainstorming, understanding complex relationships, or when you're a visual learner.",
    whoFor: "Visual learners and those studying interconnected topics."
  }
];

export default function StudyLibrary() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Study Techniques Library
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master proven learning methods to unlock your potential. Each technique is backed by science and ready to use.
        </p>
      </div>

      {/* Featured Technique */}
      <Card className="bg-gradient-focus text-secondary-foreground shadow-glow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Lightbulb className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl">Featured: Feynman Technique</CardTitle>
              <CardDescription className="text-secondary-foreground/80 text-lg">
                The most powerful method for deep understanding
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-foreground/90 mb-4">
            "If you can't explain it simply, you don't understand it well enough." - Richard Feynman
          </p>
          <Button variant="energy" size="lg">
            <BookOpen className="mr-2" />
            Try Feynman Technique
          </Button>
        </CardContent>
      </Card>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyTechniques.map((technique) => (
          <Card key={technique.id} className="shadow-soft hover:shadow-focus transition-all group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <technique.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <Badge variant="secondary">{technique.difficulty}</Badge>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {technique.name}
              </CardTitle>
              <CardDescription>{technique.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {technique.timeRequired}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {technique.difficulty}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Best for:</p>
                <div className="flex flex-wrap gap-1">
                  {technique.bestFor.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button variant="default" className="w-full">
                  Learn Technique
                </Button>
                <Button variant="outline" className="w-full">
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-subtle p-8 text-center shadow-soft">
        <h3 className="text-2xl font-bold mb-4">Ready to build your perfect study session?</h3>
        <p className="text-muted-foreground mb-6">
          Combine these techniques using our Session Builder to create powerful learning experiences.
        </p>
        <Button variant="hero" size="lg">
          <Target className="mr-2" />
          Open Session Builder
        </Button>
      </Card>
    </div>
  );
}