import { Lightbulb } from 'lucide-react';
import { STEP_TYPES } from './flow-builder-step-types';
import { StepIcon } from './step-icons';

interface AddStepPanelProps {
  onAddStep: (type: string) => void;
}

export function AddStepPanel({ onAddStep }: AddStepPanelProps) {
  return (
    <>
      <h2 className="h2 add-step-heading">Add Step</h2>
      <div className="add-step-grid">
        {STEP_TYPES.map((type) => (
          <button
            key={type.value}
            className="add-step-type-btn"
            onClick={() => onAddStep(type.value)}
          >
            <StepIcon type={type.value} size={24} />
            <span className="add-step-type-label">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="add-step-tips">
        <div className="small add-step-tips-title">
          <Lightbulb size={14} className="add-step-tips-icon" />
          Quick Tips
        </div>
        <ul className="add-step-tips-list">
          <li>
            Use <code className="add-step-tips-code">goto</code> to navigate to pages
          </li>
          <li>
            Use <code className="add-step-tips-code">caption</code> to show explanatory text
          </li>
          <li>
            Use <code className="add-step-tips-code">highlight</code> to draw attention to elements
          </li>
          <li>
            Parameters: Use <code className="add-step-tips-code">{'{{paramName}}'}</code> in values
          </li>
        </ul>
      </div>
    </>
  );
}
