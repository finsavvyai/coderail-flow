import { GripVertical, Trash2 } from 'lucide-react';
import type { Step } from './flow-builder-types';
import { STEP_TYPES } from './flow-builder-step-types';
import { StepIcon } from './step-icons';

interface StepListProps {
  steps: Step[];
  selectedStep: number | null;
  onSelectStep: (index: number) => void;
  onDeleteStep: (index: number) => void;
}

export function StepList({ steps, selectedStep, onSelectStep, onDeleteStep }: StepListProps) {
  if (steps.length === 0) {
    return (
      <div className="small" style={{ color: '#a8b3cf', textAlign: 'center', padding: 20 }}>
        No steps yet. Add steps from the panel on the right.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {steps.map((step, i) => {
        const config = STEP_TYPES.find((t) => t.value === step.type);
        return (
          <div
            key={i}
            onClick={() => onSelectStep(i)}
            style={{
              padding: 10,
              background: selectedStep === i ? 'rgba(99,102,241,0.15)' : '#1a1a1a',
              border: `1px solid ${selectedStep === i ? '#6366f1' : '#2a2a2a'}`,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <GripVertical size={14} style={{ color: '#a8b3cf' }} />
            <StepIcon type={step.type} size={16} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{config?.label}</div>
              <div className="small" style={{ color: '#a8b3cf' }}>
                {step.narrate || step.text || step.elementId || step.url || `Step ${i + 1}`}
              </div>
            </div>
            <button
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStep(i);
              }}
              style={{ padding: '8px 12px', background: '#2a1a1a', minHeight: 44, minWidth: 44 }}
              aria-label="Delete step"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
