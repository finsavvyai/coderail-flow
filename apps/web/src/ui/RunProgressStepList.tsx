import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface StepProgress {
  index: number;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

interface RunProgressStepListProps {
  steps: StepProgress[];
}

export type { StepProgress };

export function RunProgressStepList({ steps }: RunProgressStepListProps) {
  return (
    <div className="rpsl-list">
      {steps.map((step, i) => {
        const stepClass = `rpsl-step${step.status === 'running' ? ' rpsl-step--running' : ''}`;
        const nameClass =
          step.status === 'pending'
            ? 'rpsl-step-name--pending'
            : step.status === 'running'
              ? 'rpsl-step-name--running'
              : step.status === 'completed'
                ? 'rpsl-step-name--completed'
                : 'rpsl-step-name--failed';

        return (
          <div key={i} className={stepClass}>
            {step.status === 'pending' && <div className="rpsl-pending-dot" />}
            {step.status === 'running' && (
              <Loader2 size={16} className="spin ftr-status-icon-accent" />
            )}
            {step.status === 'completed' && (
              <CheckCircle size={16} className="ftr-status-icon-success" />
            )}
            {step.status === 'failed' && (
              <XCircle size={16} className="ftr-status-icon-error" />
            )}
            <span className={nameClass}>Step {i + 1}</span>
            {step.duration && (
              <span className="rpsl-duration">
                {(step.duration / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
