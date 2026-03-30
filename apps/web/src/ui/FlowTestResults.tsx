import { Play, AlertCircle, CheckCircle, XCircle, Loader, Circle } from 'lucide-react';
import type { FlowTestStatus, StepDetail } from './useFlowTest';

interface FlowStep {
  type: string;
  url?: string;
  narrate?: string;
  text?: string;
  elementId?: string;
  value?: string;
}

interface FlowTestResultsProps {
  status: FlowTestStatus;
  currentStep: number;
  totalSteps: number;
  error: string | null;
  runId: string | null;
  testing: boolean;
  stepDetails: StepDetail[];
  flowSteps: FlowStep[];
  onStartTest: () => void;
  onReset: () => void;
  onClose: () => void;
}

function getStatusIcon(status: FlowTestStatus) {
  switch (status) {
    case 'running':
      return <Loader size={48} className="spin ftr-status-icon-accent" />;
    case 'succeeded':
      return <CheckCircle size={48} className="ftr-status-icon-success" />;
    case 'failed':
      return <XCircle size={48} className="ftr-status-icon-error" />;
    default:
      return <Play size={48} className="ftr-status-icon-muted" />;
  }
}

function getStatusText(status: FlowTestStatus, currentStep: number, totalSteps: number) {
  switch (status) {
    case 'running':
      return `Testing flow... (Step ${currentStep}/${totalSteps})`;
    case 'succeeded':
      return 'Flow test completed successfully!';
    case 'failed':
      return 'Flow test failed';
    default:
      return 'Ready to test your flow';
  }
}

function stepLabel(step: FlowStep, idx: number): string {
  const prefix = `${idx + 1}.`;
  if (step.narrate) return `${prefix} ${step.narrate}`;
  if (step.type === 'goto') return `${prefix} Navigate to ${step.url || 'page'}`;
  if (step.type === 'click') return `${prefix} Click ${step.elementId || 'element'}`;
  if (step.type === 'fill')
    return `${prefix} Fill "${step.value || ''}" into ${step.elementId || 'field'}`;
  if (step.type === 'caption') return `${prefix} ${step.text || 'Caption'}`;
  if (step.type === 'pause') return `${prefix} Pause`;
  return `${prefix} ${step.type}`;
}

function StepIcon({ detail }: { detail?: StepDetail }) {
  if (!detail) return <Circle size={14} className="ftr-status-icon-dim" />;
  if (detail.status === 'running') {
    return <Loader size={14} className="spin ftr-status-icon-accent" />;
  }
  if (detail.status === 'ok') {
    return <CheckCircle size={14} className="ftr-status-icon-success" />;
  }
  return <XCircle size={14} className="ftr-status-icon-error" />;
}

export function FlowTestResults({
  status,
  currentStep,
  totalSteps,
  error,
  runId,
  testing,
  stepDetails,
  flowSteps,
  onStartTest,
  onReset,
  onClose,
}: FlowTestResultsProps) {
  const statusBoxClass =
    `ftr-status-box${status === 'failed' ? ' ftr-status-box--failed' : ''}`;

  return (
    <>
      <div className={statusBoxClass}>
        <div className="ftr-status-text">
          {getStatusText(status, currentStep, totalSteps)}
        </div>
      </div>

      {/* Per-step progress list */}
      {(status === 'running' || status === 'succeeded' || status === 'failed') &&
        flowSteps.length > 0 && (
          <div className="ftr-step-list">
            {flowSteps.map((fs, i) => {
              const detail = stepDetails.find((d) => d.idx === i);
              const rowClass = [
                'ftr-step-row',
                detail?.status === 'ok'
                  ? 'ftr-step-row--ok'
                  : detail?.status === 'failed'
                    ? 'ftr-step-row--failed'
                    : 'ftr-step-row--default',
                detail?.status === 'running' ? 'ftr-step-row--running' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={i} className={rowClass}>
                  <StepIcon detail={detail} />
                  <span className="ftr-step-label">{stepLabel(fs, i)}</span>
                  {detail?.status === 'ok' && (
                    <span className="ftr-step-tag ftr-step-tag--ok">done</span>
                  )}
                  {detail?.status === 'failed' && (
                    <span className="ftr-step-tag ftr-step-tag--failed">failed</span>
                  )}
                  {detail?.status === 'running' && (
                    <span className="ftr-step-tag ftr-step-tag--running">running</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {/* Progress bar */}
      {status === 'running' && totalSteps > 0 && (
        <div className="ftr-progress-bar-track">
          <div
            className="ftr-progress-bar-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {error && (
        <div className="ftr-error-box">
          <div className="ftr-error-header">
            <AlertCircle size={16} className="ftr-status-icon-error" />
            <span className="ftr-error-title">Error</span>
          </div>
          <div className="ftr-error-body">{error}</div>
        </div>
      )}

      <div className="ftr-actions">
        {status === 'idle' && (
          <button
            onClick={onStartTest}
            disabled={testing}
            className="btn ftr-btn-start"
          >
            <Play size={16} className="ftr-inline-icon" />
            Start Test
          </button>
        )}

        {status === 'succeeded' && runId && (
          <button
            onClick={() => window.open(`/app?run=${runId}`, '_blank')}
            className="btn ftr-btn-view"
          >
            View Full Results
          </button>
        )}

        {(status === 'succeeded' || status === 'failed') && (
          <button
            onClick={onReset}
            className="btn ftr-btn-again"
          >
            Test Again
          </button>
        )}

        <button
          onClick={onClose}
          className="btn ftr-btn-close"
        >
          Close
        </button>
      </div>
    </>
  );
}

export { getStatusIcon };
