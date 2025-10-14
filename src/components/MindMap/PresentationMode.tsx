import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';

interface PresentationModeProps {
  nodes: Node[];
  edges: Edge[];
  onExit: () => void;
}

export default function PresentationMode({ nodes, edges, onExit }: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  const getBranchNodes = (nodeId: string, visited = new Set<string>()): Node[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);

    const currentNode = nodes.find((n) => n.id === nodeId);
    if (!currentNode) return [];

    const childEdges = edges.filter((e) => e.source === nodeId);
    const children = childEdges.flatMap((edge) => getBranchNodes(edge.target, visited));

    return [currentNode, ...children];
  };

  const allBranches = rootNodes.map((root) => getBranchNodes(root.id));
  const currentBranch = allBranches[currentIndex] || [];
  const currentNode = currentBranch[0];

  const handleNext = () => {
    if (currentIndex < allBranches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onExit}>
            <X className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Branch {currentIndex + 1} of {allBranches.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
          >
            {isAutoPlay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {currentNode && (
            <Card className="p-12 text-center shadow-glow">
              <h2 className="text-5xl font-bold mb-6">{currentNode.data.label}</h2>
              
              {currentBranch.length > 1 && (
                <div className="mt-8 space-y-4">
                  {currentBranch.slice(1).map((node, idx) => (
                    <Card
                      key={node.id}
                      className="p-6 text-left border-l-4"
                      style={{ borderLeftColor: node.data.color || 'hsl(var(--primary))' }}
                    >
                      <h3 className="text-2xl font-semibold mb-2">{node.data.label}</h3>
                      {node.data.attachments && node.data.attachments.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          📎 {node.data.attachments.length} attachment(s)
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="h-20 border-t border-border flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {allBranches.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex ? 'bg-primary w-8' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex === allBranches.length - 1}
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
