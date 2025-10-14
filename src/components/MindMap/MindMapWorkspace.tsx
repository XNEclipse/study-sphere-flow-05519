import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  X,
  Plus,
  Download,
  Play,
  Undo,
  Redo,
  Save,
  FolderOpen,
  Palette,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  ChevronDown,
  ChevronRight,
  Award,
  Maximize,
  Grid,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import CustomNode from './CustomNode';
import StylePanel from './StylePanel';
import TemplateLibrary from './TemplateLibrary';
import PresentationMode from './PresentationMode';
import ProgressTracker from './ProgressTracker';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface MindMapWorkspaceProps {
  onClose: () => void;
}

interface MindMapData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  lastModified: string;
}

export default function MindMapWorkspace({ onClose }: MindMapWorkspaceProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [mapName, setMapName] = useState('Untitled Mind Map');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (nodes.length > 0 || edges.length > 0) {
        saveMap();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [nodes, edges, mapName, currentMapId]);

  // Sync status indicator
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'offline'>('saved');

  const saveMap = useCallback(() => {
    setSyncStatus('saving');
    const maps = JSON.parse(localStorage.getItem('mindMaps') || '[]');
    const mapData: MindMapData = {
      id: currentMapId || Date.now().toString(),
      name: mapName,
      nodes,
      edges,
      lastModified: new Date().toISOString(),
    };

    const existingIndex = maps.findIndex((m: MindMapData) => m.id === mapData.id);
    if (existingIndex >= 0) {
      maps[existingIndex] = mapData;
    } else {
      maps.push(mapData);
      setCurrentMapId(mapData.id);
    }

    localStorage.setItem('mindMaps', JSON.stringify(maps));
    
    // Update progress
    const progress = JSON.parse(localStorage.getItem('mindMapProgress') || '{}');
    if (!progress.mapsCreated) progress.mapsCreated = 0;
    progress.mapsCreated += 1;
    localStorage.setItem('mindMapProgress', JSON.stringify(progress));

    setTimeout(() => setSyncStatus('saved'), 500);
    toast.success('Mind map saved successfully!');
  }, [nodes, edges, mapName, currentMapId]);

  const loadMap = useCallback((mapId: string) => {
    const maps = JSON.parse(localStorage.getItem('mindMaps') || '[]');
    const map = maps.find((m: MindMapData) => m.id === mapId);
    if (map) {
      setNodes(map.nodes);
      setEdges(map.edges);
      setMapName(map.name);
      setCurrentMapId(map.id);
      toast.success('Mind map loaded!');
    }
  }, [setNodes, setEdges]);

  // History management
  const addToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      addToHistory();
    }
  }, [nodes.length, edges.length]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(historyIndex - 1);
      toast.info('Undo');
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      toast.info('Redo');
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addNode = useCallback(
    (type = 'default', position?: { x: number; y: number }) => {
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position: position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        data: {
          label: 'New Node',
          shape: 'rounded',
          color: 'hsl(224, 100%, 45%)',
          icon: null,
          collapsed: false,
          attachments: [],
        },
      };
      setNodes((nds) => [...nds, newNode]);
      toast.success('Node added');
    },
    [setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<Node['data']>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
      toast.success('Node deleted');
    }
  }, [selectedNode, setNodes, setEdges]);

  // Export functions
  const exportToPNG = useCallback(() => {
    if (reactFlowWrapper.current) {
      toPng(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        width: reactFlowWrapper.current.offsetWidth,
        height: reactFlowWrapper.current.offsetHeight,
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${mapName}.png`;
          link.href = dataUrl;
          link.click();
          toast.success('Exported as PNG!');
        })
        .catch((err) => {
          console.error('Export failed:', err);
          toast.error('Export failed');
        });
    }
  }, [mapName]);

  const exportToPDF = useCallback(() => {
    if (reactFlowWrapper.current) {
      toPng(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
      })
        .then((dataUrl) => {
          const pdf = new jsPDF('landscape');
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${mapName}.pdf`);
          toast.success('Exported as PDF!');
        })
        .catch((err) => {
          console.error('Export failed:', err);
          toast.error('Export failed');
        });
    }
  }, [mapName]);

  const exportToText = useCallback(() => {
    let outline = `# ${mapName}\n\n`;
    
    const buildOutline = (nodeId: string, depth = 0): string => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return '';
      
      const indent = '  '.repeat(depth);
      let text = `${indent}- ${node.data.label}\n`;
      
      const childEdges = edges.filter((e) => e.source === nodeId);
      childEdges.forEach((edge) => {
        text += buildOutline(edge.target, depth + 1);
      });
      
      return text;
    };

    const rootNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );
    rootNodes.forEach((rootNode) => {
      outline += buildOutline(rootNode.id);
    });

    const blob = new Blob([outline], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `${mapName}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success('Exported as text outline!');
  }, [nodes, edges, mapName]);

  const applyTemplate = useCallback((templateNodes: Node[], templateEdges: Edge[]) => {
    setNodes(templateNodes);
    setEdges(templateEdges);
    setShowTemplates(false);
    toast.success('Template applied!');
  }, [setNodes, setEdges]);

  if (isPresentationMode) {
    return (
      <PresentationMode
        nodes={nodes}
        edges={edges}
        onExit={() => setIsPresentationMode(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Input
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="text-lg font-semibold w-64 border-none focus-visible:ring-0"
          />
          <Badge variant={syncStatus === 'saved' ? 'default' : 'secondary'}>
            {syncStatus === 'saved' ? '✓ Saved' : syncStatus === 'saving' ? 'Saving...' : 'Offline'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNode()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Node
          </Button>
          <Button variant="outline" size="sm" onClick={saveMap}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsPresentationMode(true)}>
            <Play className="h-4 w-4 mr-2" />
            Present
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="h-[calc(100vh-4rem)] flex">
        {/* ReactFlow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#e5e7eb" gap={16} />
            <Controls />
            <MiniMap zoomable pannable />
            
            <Panel position="top-left" className="bg-card border border-border rounded-lg p-2 shadow-soft">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>💡 Tip: Double-click node to edit</div>
                <div>⌨️ Press N to add node</div>
                <div>⌨️ Press Delete to remove</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-border bg-card overflow-y-auto">
          <Tabs defaultValue="style" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="style">
                <Palette className="h-4 w-4 mr-2" />
                Style
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="h-4 w-4 mr-2" />
                Export
              </TabsTrigger>
              <TabsTrigger value="progress">
                <Award className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="p-4">
              {selectedNode ? (
                <StylePanel
                  node={selectedNode}
                  onUpdateNode={updateNodeData}
                  onDeleteNode={deleteSelectedNode}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a node to customize its style
                </div>
              )}
            </TabsContent>

            <TabsContent value="export" className="p-4 space-y-4">
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold">Export Options</h3>
                <Button variant="outline" className="w-full justify-start" onClick={exportToPNG}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Export as PNG
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportToPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportToText}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Text Outline
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="p-4">
              <ProgressTracker />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplates && (
        <TemplateLibrary
          onApplyTemplate={applyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Keyboard shortcuts */}
      <div className="hidden">
        <input
          onKeyDown={(e) => {
            if (e.key === 'n' || e.key === 'N') {
              addNode();
            } else if (e.key === 'Delete' && selectedNode) {
              deleteSelectedNode();
            } else if (e.ctrlKey && e.key === 'z') {
              undo();
            } else if (e.ctrlKey && e.key === 'y') {
              redo();
            }
          }}
          autoFocus
        />
      </div>
    </div>
  );
}
