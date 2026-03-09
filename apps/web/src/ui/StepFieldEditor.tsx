import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Step, StepTypeConfig } from './flow-builder-types';
import { renderStepFields } from './StepFieldRenderers';
import { StepIcon } from './step-icons';

interface StepFieldEditorProps {
  step: Step;
  stepConfig: StepTypeConfig;
  stepIndex: number;
  totalSteps: number;
  onUpdate: (updates: Partial<Step>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function StepFieldEditor({
  step,
  stepConfig,
  stepIndex,
  totalSteps,
  onUpdate,
  onMoveUp,
  onMoveDown,
}: StepFieldEditorProps) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h2 className="h2" style={{ margin: 0 }}>
          <StepIcon type={step.type} /> {stepConfig.label} — Step {stepIndex + 1}
        </h2>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn"
            onClick={onMoveUp}
            disabled={stepIndex === 0}
            style={{ padding: '10px 12px' }}
            aria-label="Move step up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            className="btn"
            onClick={onMoveDown}
            disabled={stepIndex === totalSteps - 1}
            style={{ padding: '10px 12px' }}
            aria-label="Move step down"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {renderStepFields(stepConfig.fields, step, onUpdate)}
      </div>
    </>
  );
}
