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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            background: step.status === 'running' ? '#3b82f610' : 'transparent',
            borderRadius: 4,
            fontSize: 13,
            transition: 'all 0.2s',
          }}
        >
          {step.status === 'pending' && (
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #444' }} />
          )}
          {step.status === 'running' && (
            <Loader2 size={16} className="spin" style={{ color: '#3b82f6' }} />
          )}
          {step.status === 'completed' && <CheckCircle size={16} style={{ color: '#22c55e' }} />}
          {step.status === 'failed' && <XCircle size={16} style={{ color: '#ef4444' }} />}
          <span
            style={{
              color:
                step.status === 'pending'
                  ? '#a3a3a3'
                  : step.status === 'running'
                    ? '#fff'
                    : step.status === 'completed'
                      ? '#888'
                      : '#ef4444',
            }}
          >
            Step {i + 1}
          </span>
          {step.duration && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#a3a3a3' }}>
              {(step.duration / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
