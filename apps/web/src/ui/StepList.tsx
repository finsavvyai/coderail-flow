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
      <div className="step-list-empty">
        No steps yet. Add steps from the panel on the right.
      </div>
    );
  }

  return (
    <div className="step-list">
      {steps.map((step, i) => {
        const config = STEP_TYPES.find((t) => t.value === step.type);
        return (
          <div
            key={i}
            onClick={() => onSelectStep(i)}
            className={`step-list-item${selectedStep === i ? ' selected' : ''}`}
          >
            <GripVertical size={14} className="step-list-grip" />
            <StepIcon type={step.type} size={16} />
            <div className="step-list-content">
              <div className="step-list-label">{config?.label}</div>
              <div className="step-list-detail">
                {step.narrate || step.text || step.elementId || step.url || `Step ${i + 1}`}
              </div>
            </div>
            <button
              className="step-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStep(i);
              }}
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
