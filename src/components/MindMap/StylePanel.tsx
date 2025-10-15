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
  { name: 'Lavender', value: 'hsl(270, 60%, 85%)' },
  { name: 'Mint', value: 'hsl(160, 50%, 80%)' },
  { name: 'Peach', value: 'hsl(20, 80%, 85%)' },
  { name: 'Sky', value: 'hsl(200, 60%, 85%)' },
  { name: 'Rose', value: 'hsl(340, 60%, 85%)' },
  { name: 'Lemon', value: 'hsl(55, 70%, 85%)' },
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (jpg, png, gif, webp)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment = {
        id: Date.now().toString(),
        type: 'image',
        url: dataUrl,
      };

      const currentAttachments = node.data.attachments || [];
      onUpdateNode(node.id, {
        attachments: [...currentAttachments, newAttachment],
      });

      toast.success('Image uploaded!');
    };
    reader.readAsDataURL(file);
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
              Image URL
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

          <div className="text-center text-sm text-muted-foreground">or</div>

          <div>
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload image file (max 5MB)
            </p>
          </div>

          {node.data.attachments && node.data.attachments.length > 0 && (
            <Card className="p-3 space-y-2">
              {node.data.attachments.map((attachment: any) => (
                <div key={attachment.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {attachment.type === 'link' ? (
                        <LinkIcon className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ImageIcon className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {attachment.url.startsWith('data:') ? 'Uploaded image' : attachment.url}
                      </span>
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
                  {attachment.type === 'image' && (
                    <img
                      src={attachment.url}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
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
