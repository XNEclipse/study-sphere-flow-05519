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
} from 'lucide-react';

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

  const shapeStyles = {
    rounded: 'rounded-lg',
    circle: 'rounded-full aspect-square',
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
        className={`min-w-[150px] max-w-[250px] p-3 shadow-focus border-2 cursor-pointer transition-all hover:shadow-glow ${
          shapeStyles[data.shape || 'rounded']
        }`}
        style={{
          backgroundColor: data.color || 'hsl(var(--card))',
          borderColor: data.color || 'hsl(var(--border))',
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-start gap-2">
          {data.collapsed !== undefined && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => data.onToggleCollapse?.()}
            >
              {data.collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}

          {IconComponent && (
            <IconComponent className="h-5 w-5 flex-shrink-0" style={{ color: data.color }} />
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
              <div className="font-medium text-sm break-words">{label}</div>
            )}

            {data.attachments && data.attachments.length > 0 && (
              <Badge variant="secondary" className="mt-2 text-xs">
                <Paperclip className="h-3 w-3 mr-1" />
                {data.attachments.length}
              </Badge>
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
