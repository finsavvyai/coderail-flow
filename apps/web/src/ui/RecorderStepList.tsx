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
    <div className="card rec-steplist-card">
      <StepListHeader
        count={recordedActions.length}
        activeStepIndex={activeStepIndex}
        setActiveStepIndex={setActiveStepIndex}
        maxIndex={recordedActions.length - 1}
        showSubtitleOverlay={showSubtitleOverlay}
        setShowSubtitleOverlay={setShowSubtitleOverlay}
        onClear={onClear}
      />
      <div className="rec-steplist-body">
        {recordedActions.length === 0 ? (
          <div className="rec-steplist-empty">
            <Plus size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>No actions recorded yet</div>
            <div className="rec-steplist-hint">Interact with the page to record steps</div>
          </div>
        ) : (
          <div className="rec-steplist-items">
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
        <div className="rec-steplist-footer">
          <div className="rec-steplist-footer-label">Quick Add:</div>
          <div className="rec-steplist-footer-actions">
            <button className="rec-quick-add-btn" onClick={() => onAddManual('click')}>
              + Click
            </button>
            <button className="rec-quick-add-btn" onClick={() => onAddManual('fill')}>
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
    <div className="rec-steplist-header">
      <span className="rec-steplist-title">Recorded Steps ({count})</span>
      <div className="rec-steplist-nav">
        {count > 0 && (
          <>
            <button
              className="rec-nav-btn"
              onClick={() => setActiveStepIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
              disabled={activeStepIndex === null || activeStepIndex <= 0}
              aria-label="Previous step"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="rec-nav-btn"
              onClick={() => setActiveStepIndex((i) => (i !== null && i < maxIndex ? i + 1 : i))}
              disabled={activeStepIndex === null || activeStepIndex >= maxIndex}
              aria-label="Next step"
            >
              <ChevronRight size={14} />
            </button>
            <button
              className={`rec-nav-btn${showSubtitleOverlay ? ' active' : ''}`}
              onClick={() => setShowSubtitleOverlay((v) => !v)}
              aria-label={showSubtitleOverlay ? 'Hide subtitles' : 'Show subtitles'}
              aria-pressed={showSubtitleOverlay}
            >
              <MessageSquare size={14} />
            </button>
            <button
              className="rec-nav-btn rec-clear-btn"
              onClick={onClear}
              aria-label="Clear all steps"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
