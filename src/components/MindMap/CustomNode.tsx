import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Target,
  Paperclip,
  ExternalLink,
} from 'lucide-react';

// Utility to calculate brightness and return contrasting text color
const getContrastColor = (hslColor: string): string => {
  if (!hslColor || !hslColor.includes('hsl')) return '#000000';
  
  const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return '#000000';
  
  const lightness = parseInt(match[3]);
  return lightness > 60 ? '#000000' : '#ffffff';
};

const iconMap: Record<string, any> = {
  book: BookOpen,
  lightbulb: Lightbulb,
  target: Target,
};

function CustomNode({ data, isConnectable }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Node');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onUpdateLabel) {
      data.onUpdateLabel(label);
    }
  };

  const IconComponent = data.icon ? iconMap[data.icon] : null;
  const contrastColor = getContrastColor(data.color || 'hsl(var(--card))');

  const shapeStyles = {
    rounded: 'rounded-lg',
    circle: 'rounded-full aspect-square flex items-center justify-center min-w-[120px] min-h-[120px]',
    pill: 'rounded-full',
  };

  return (
    <div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-primary"
      />
      
      <Card
        className={`min-w-[150px] max-w-[250px] p-3 shadow-soft border-2 cursor-pointer transition-all hover:shadow-focus ${
          shapeStyles[data.shape || 'rounded']
        }`}
        style={{
          backgroundColor: data.color || 'hsl(var(--card))',
          borderColor: data.color || 'hsl(var(--border))',
          color: contrastColor,
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center gap-2">
          {data.collapsed !== undefined && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 flex-shrink-0"
              onClick={() => data.onToggleCollapse?.()}
              style={{ color: contrastColor }}
            >
              {data.collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}

          {IconComponent && (
            <IconComponent className="h-5 w-5 flex-shrink-0" style={{ color: contrastColor }} />
          )}

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBlur();
                }}
                autoFocus
                className="h-7 text-sm"
              />
            ) : (
              <div className="font-medium text-sm break-words text-center">{label}</div>
            )}

            {data.attachments && data.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {data.attachments.slice(0, 2).map((attachment: any) => (
                  <div key={attachment.id} className="space-y-1">
                    {attachment.type === 'image' ? (
                      <div className="relative group">
                        <img
                          src={attachment.url}
                          alt="Attachment"
                          className="w-full h-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs hover:underline"
                        style={{ color: contrastColor }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">Link</span>
                      </a>
                    )}
                  </div>
                ))}
                {data.attachments.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    +{data.attachments.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            {data.collapsed && data.childCount && (
              <Badge variant="outline" className="mt-2 text-xs">
                {data.childCount} hidden
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
}

export default memo(CustomNode);
