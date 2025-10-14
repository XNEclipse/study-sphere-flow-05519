import { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Lightbulb, Target, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface StylePanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: Partial<Node['data']>) => void;
  onDeleteNode: () => void;
}

const colorPresets = [
  { name: 'Primary', value: 'hsl(224, 100%, 45%)' },
  { name: 'Secondary', value: 'hsl(260, 90%, 45%)' },
  { name: 'Success', value: 'hsl(142, 76%, 36%)' },
  { name: 'Accent', value: 'hsl(30, 95%, 55%)' },
  { name: 'Muted', value: 'hsl(220, 15%, 70%)' },
];

const shapeOptions = [
  { name: 'Rounded', value: 'rounded' },
  { name: 'Circle', value: 'circle' },
  { name: 'Pill', value: 'pill' },
];

const iconOptions = [
  { name: 'Book', value: 'book', Icon: BookOpen },
  { name: 'Lightbulb', value: 'lightbulb', Icon: Lightbulb },
  { name: 'Target', value: 'target', Icon: Target },
];

export default function StylePanel({ node, onUpdateNode, onDeleteNode }: StylePanelProps) {
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState<'link' | 'image'>('link');

  const handleAddAttachment = () => {
    if (!attachmentUrl) return;

    const newAttachment = {
      id: Date.now().toString(),
      type: attachmentType,
      url: attachmentUrl,
    };

    const currentAttachments = node.data.attachments || [];
    onUpdateNode(node.id, {
      attachments: [...currentAttachments, newAttachment],
    });

    setAttachmentUrl('');
    toast.success('Attachment added!');
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const currentAttachments = node.data.attachments || [];
    onUpdateNode(node.id, {
      attachments: currentAttachments.filter((a: any) => a.id !== attachmentId),
    });
    toast.success('Attachment removed');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Node Content</h3>
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) => onUpdateNode(node.id, { label: e.target.value })}
            placeholder="Node label"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Color</h3>
        <div className="grid grid-cols-3 gap-2">
          {colorPresets.map((preset) => (
            <Button
              key={preset.value}
              variant={node.data.color === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateNode(node.id, { color: preset.value })}
              className="h-8"
            >
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: preset.value }}
              />
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Shape</h3>
        <div className="grid grid-cols-3 gap-2">
          {shapeOptions.map((shape) => (
            <Button
              key={shape.value}
              variant={node.data.shape === shape.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateNode(node.id, { shape: shape.value })}
            >
              {shape.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Icon</h3>
        <div className="grid grid-cols-3 gap-2">
          {iconOptions.map((icon) => (
            <Button
              key={icon.value}
              variant={node.data.icon === icon.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateNode(node.id, { icon: icon.value })}
            >
              <icon.Icon className="h-4 w-4 mr-1" />
              {icon.name}
            </Button>
          ))}
          <Button
            variant={!node.data.icon ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdateNode(node.id, { icon: null })}
          >
            None
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Attachments</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={attachmentType === 'link' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAttachmentType('link')}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              Link
            </Button>
            <Button
              variant={attachmentType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAttachmentType('image')}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Image
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder={`Enter ${attachmentType} URL`}
            />
            <Button size="sm" onClick={handleAddAttachment}>
              Add
            </Button>
          </div>

          {node.data.attachments && node.data.attachments.length > 0 && (
            <Card className="p-3 space-y-2">
              {node.data.attachments.map((attachment: any) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {attachment.type === 'link' ? (
                      <LinkIcon className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <ImageIcon className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span className="truncate">{attachment.url}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <Separator />

      <Button variant="destructive" className="w-full" onClick={onDeleteNode}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Node
      </Button>
    </div>
  );
}
