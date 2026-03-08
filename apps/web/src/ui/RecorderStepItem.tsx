import { Trash2, MousePointer, Type, Navigation, Eye, Play, MessageSquare } from 'lucide-react';
import type { RecordedAction } from './FlowRecorder.types';
import { getActionDescription } from './FlowRecorder.utils';

function getActionIcon(type: string) {
  switch (type) {
    case 'click':
      return <MousePointer size={14} />;
    case 'fill':
      return <Type size={14} />;
    case 'goto':
      return <Navigation size={14} />;
    case 'select':
      return <Eye size={14} />;
    default:
      return <Play size={14} />;
  }
}

export function getActionColor(type: string): string {
  switch (type) {
    case 'goto':
      return '#60a5fa';
    case 'click':
      return '#f59e0b';
    case 'fill':
      return '#22c55e';
    default:
      return '#8b8b8b';
  }
}

export function StepItem({
  action,
  index,
  isActive,
  onSelect,
  onRemove,
  onSubtitleChange,
}: {
  action: RecordedAction;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onSubtitleChange: (subtitle: string) => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '8px 10px',
        background: isActive ? '#1e1a2e' : '#1a1a1a',
        borderRadius: 6,
        border: isActive ? '1px solid #6366f1' : '1px solid #2a2a2a',
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: isActive ? '#6366f1' : '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            flexShrink: 0,
            color: isActive ? '#fff' : undefined,
          }}
        >
          {index + 1}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: getActionColor(action.type),
          }}
        >
          {getActionIcon(action.type)}
        </span>
        <span
          style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {getActionDescription(action)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove step ${index + 1}`}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare
          size={11}
          style={{ color: action.subtitle ? '#a78bfa' : '#444', flexShrink: 0 }}
        />
        <input
          className="input"
          placeholder="Add subtitle for this step..."
          value={action.subtitle || ''}
          onChange={(e) => onSubtitleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            fontSize: 11,
            padding: '4px 8px',
            background: action.subtitle ? 'rgba(99,102,241,0.08)' : '#111',
            border: action.subtitle ? '1px solid rgba(99,102,241,0.2)' : '1px solid #222',
            borderRadius: 4,
            color: action.subtitle ? '#c4b5fd' : '#888',
          }}
        />
      </div>
    </div>
  );
}
