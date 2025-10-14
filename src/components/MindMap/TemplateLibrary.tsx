import { Node, Edge, MarkerType } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, FileText, Calendar, Lightbulb } from 'lucide-react';

interface TemplateLibraryProps {
  onApplyTemplate: (nodes: Node[], edges: Edge[]) => void;
  onClose: () => void;
}

const templates = [
  {
    id: 'study-summary',
    name: 'Study Summary',
    description: 'Organize chapter summaries and key concepts',
    icon: BookOpen,
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: { label: 'Chapter Topic', shape: 'rounded', color: 'hsl(224, 100%, 45%)' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 100, y: 200 },
        data: { label: 'Key Concept 1', shape: 'rounded', color: 'hsl(142, 76%, 36%)' },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 400, y: 200 },
        data: { label: 'Key Concept 2', shape: 'rounded', color: 'hsl(142, 76%, 36%)' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    ],
  },
  {
    id: 'essay-plan',
    name: 'Essay Plan',
    description: 'Structure your essay with introduction, body, and conclusion',
    icon: FileText,
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: { label: 'Essay Topic', shape: 'rounded', color: 'hsl(224, 100%, 45%)' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 250, y: 150 },
        data: { label: 'Introduction', shape: 'rounded', color: 'hsl(260, 90%, 45%)' },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 100, y: 250 },
        data: { label: 'Point 1', shape: 'rounded', color: 'hsl(142, 76%, 36%)' },
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 250, y: 250 },
        data: { label: 'Point 2', shape: 'rounded', color: 'hsl(142, 76%, 36%)' },
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 400, y: 250 },
        data: { label: 'Point 3', shape: 'rounded', color: 'hsl(142, 76%, 36%)' },
      },
      {
        id: '6',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: { label: 'Conclusion', shape: 'rounded', color: 'hsl(260, 90%, 45%)' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-6', source: '3', target: '6', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-6', source: '4', target: '6', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    ],
  },
  {
    id: 'project-timeline',
    name: 'Project Timeline',
    description: 'Plan project phases and milestones',
    icon: Calendar,
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { label: 'Phase 1: Research', shape: 'rounded', color: 'hsl(224, 100%, 45%)' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 300, y: 100 },
        data: { label: 'Phase 2: Planning', shape: 'rounded', color: 'hsl(260, 90%, 45%)' },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 500, y: 100 },
        data: { label: 'Phase 3: Execution', shape: 'rounded', color: 'hsl(142, 76%, 36%)' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    ],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming',
    description: 'Explore ideas and connections freely',
    icon: Lightbulb,
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 150 },
        data: { label: 'Central Idea', shape: 'circle', color: 'hsl(30, 95%, 55%)' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 100, y: 50 },
        data: { label: 'Idea 1', shape: 'rounded', color: 'hsl(220, 15%, 70%)' },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: { label: 'Idea 2', shape: 'rounded', color: 'hsl(220, 15%, 70%)' },
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 100, y: 250 },
        data: { label: 'Idea 3', shape: 'rounded', color: 'hsl(220, 15%, 70%)' },
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 400, y: 250 },
        data: { label: 'Idea 4', shape: 'rounded', color: 'hsl(220, 15%, 70%)' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e1-5', source: '1', target: '5', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    ],
  },
];

export default function TemplateLibrary({ onApplyTemplate, onClose }: TemplateLibraryProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Template Library</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-focus transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <template.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onApplyTemplate(template.nodes, template.edges)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
