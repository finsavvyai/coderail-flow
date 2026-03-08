import { Plus, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import type { RecordedAction } from './FlowRecorder.types';
import { StepItem } from './RecorderStepItem';

interface RecorderStepListProps {
  recordedActions: RecordedAction[];
  activeStepIndex: number | null;
  setActiveStepIndex: (fn: (i: number | null) => number | null) => void;
  showSubtitleOverlay: boolean;
  setShowSubtitleOverlay: (fn: (v: boolean) => boolean) => void;
  onRemoveAction: (id: string) => void;
  onUpdateSubtitle: (index: number, subtitle: string) => void;
  onClear: () => void;
  onAddManual: (type: 'click' | 'fill') => void;
}

export function RecorderStepList(props: RecorderStepListProps) {
  const {
    recordedActions,
    activeStepIndex,
    setActiveStepIndex,
    showSubtitleOverlay,
    setShowSubtitleOverlay,
    onRemoveAction,
    onUpdateSubtitle,
    onClear,
    onAddManual,
  } = props;

  return (
    <div
      className="card"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 300 }}
    >
      <StepListHeader
        count={recordedActions.length}
        activeStepIndex={activeStepIndex}
        setActiveStepIndex={setActiveStepIndex}
        maxIndex={recordedActions.length - 1}
        showSubtitleOverlay={showSubtitleOverlay}
        setShowSubtitleOverlay={setShowSubtitleOverlay}
        onClear={onClear}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {recordedActions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#666', fontSize: 13 }}>
            <Plus size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>No actions recorded yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              Interact with the page to record steps
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recordedActions.map((action, idx) => (
              <StepItem
                key={action.id}
                action={action}
                index={idx}
                isActive={activeStepIndex === idx}
                onSelect={() => setActiveStepIndex(() => idx)}
                onRemove={() => onRemoveAction(action.id)}
                onSubtitleChange={(s) => onUpdateSubtitle(idx, s)}
              />
            ))}
          </div>
        )}
      </div>
      {recordedActions.length > 0 && (
        <div style={{ padding: 12, borderTop: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Quick Add:</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button
              className="btn"
              style={{ padding: '4px 8px', fontSize: 11, transition: 'background 0.15s' }}
              onClick={() => onAddManual('click')}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              + Click
            </button>
            <button
              className="btn"
              style={{ padding: '4px 8px', fontSize: 11, transition: 'background 0.15s' }}
              onClick={() => onAddManual('fill')}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              + Fill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepListHeader({
  count,
  activeStepIndex,
  setActiveStepIndex,
  maxIndex,
  showSubtitleOverlay,
  setShowSubtitleOverlay,
  onClear,
}: {
  count: number;
  activeStepIndex: number | null;
  maxIndex: number;
  setActiveStepIndex: (fn: (i: number | null) => number | null) => void;
  showSubtitleOverlay: boolean;
  setShowSubtitleOverlay: (fn: (v: boolean) => boolean) => void;
  onClear: () => void;
}) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ fontWeight: 500 }}>Recorded Steps ({count})</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {count > 0 && (
          <>
            <button
              className="btn"
              onClick={() => setActiveStepIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
              disabled={activeStepIndex === null || activeStepIndex <= 0}
              style={{ padding: '8px', background: '#2a2a2a', fontSize: 10, minHeight: 32 }}
              aria-label="Previous step"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="btn"
              onClick={() => setActiveStepIndex((i) => (i !== null && i < maxIndex ? i + 1 : i))}
              disabled={activeStepIndex === null || activeStepIndex >= maxIndex}
              style={{ padding: '8px', background: '#2a2a2a', fontSize: 10, minHeight: 32 }}
              aria-label="Next step"
            >
              <ChevronRight size={14} />
            </button>
            <button
              className="btn"
              onClick={() => setShowSubtitleOverlay((v) => !v)}
              aria-label={showSubtitleOverlay ? 'Hide subtitles' : 'Show subtitles'}
              aria-pressed={showSubtitleOverlay}
              style={{
                padding: '8px',
                background: showSubtitleOverlay ? 'rgba(99,102,241,0.2)' : '#2a2a2a',
                fontSize: 10,
                color: showSubtitleOverlay ? '#a78bfa' : '#888',
                minHeight: 32,
              }}
            >
              <MessageSquare size={14} />
            </button>
            <button
              className="btn"
              onClick={onClear}
              aria-label="Clear all steps"
              style={{ padding: '8px 12px', background: '#2a1a1a', fontSize: 11, minHeight: 32 }}
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
