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

export function getActionColorClass(type: string): string {
  switch (type) {
    case 'goto':
      return 'action-goto';
    case 'click':
      return 'action-click';
    case 'fill':
      return 'action-fill';
    default:
      return 'action-default';
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
  const hasSubtitle = Boolean(action.subtitle);
  return (
    <div onClick={onSelect} className={`step-item-container${isActive ? ' active' : ''}`}>
      <div className="step-item-row">
        <span className={`step-item-number${isActive ? ' active' : ''}`}>{index + 1}</span>
        <span className={`step-item-action-icon ${getActionColorClass(action.type)}`}>
          {getActionIcon(action.type)}
        </span>
        <span className="step-item-description">{getActionDescription(action)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove step ${index + 1}`}
          className="step-item-remove-btn"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="step-item-subtitle-row">
        <MessageSquare
          size={11}
          className={`step-item-subtitle-icon${hasSubtitle ? ' has-subtitle' : ''}`}
        />
        <input
          className={`input step-item-subtitle-input${hasSubtitle ? ' has-subtitle' : ''}`}
          placeholder="Add subtitle for this step..."
          value={action.subtitle || ''}
          onChange={(e) => onSubtitleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
