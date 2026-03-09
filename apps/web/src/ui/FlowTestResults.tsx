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
      return <Loader size={48} className="spin" style={{ color: '#3b82f6' }} />;
    case 'succeeded':
      return <CheckCircle size={48} style={{ color: '#22c55e' }} />;
    case 'failed':
      return <XCircle size={48} style={{ color: '#ef4444' }} />;
    default:
      return <Play size={48} style={{ color: '#a3a3a3' }} />;
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
  if (!detail) return <Circle size={14} style={{ color: '#555' }} />;
  if (detail.status === 'running') {
    return <Loader size={14} className="spin" style={{ color: '#3b82f6' }} />;
  }
  if (detail.status === 'ok') {
    return <CheckCircle size={14} style={{ color: '#22c55e' }} />;
  }
  return <XCircle size={14} style={{ color: '#ef4444' }} />;
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
  return (
    <>
      <div
        style={{
          padding: '16px',
          background: status === 'failed' ? '#2a1a1a' : '#1a1a1a',
          borderRadius: 8,
          border: `1px solid ${status === 'failed' ? '#ef4444' : '#2a2a2a'}`,
          marginBottom: 16,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 500 }}>
          {getStatusText(status, currentStep, totalSteps)}
        </div>
      </div>

      {/* Per-step progress list */}
      {(status === 'running' || status === 'succeeded' || status === 'failed') &&
        flowSteps.length > 0 && (
          <div
            style={{
              textAlign: 'left',
              marginBottom: 16,
              maxHeight: 240,
              overflowY: 'auto',
              background: '#111',
              borderRadius: 8,
              border: '1px solid #2a2a2a',
              padding: '8px 0',
            }}
          >
            {flowSteps.map((fs, i) => {
              const detail = stepDetails.find((d) => d.idx === i);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 14px',
                    fontSize: 13,
                    color:
                      detail?.status === 'ok'
                        ? '#aaa'
                        : detail?.status === 'failed'
                          ? '#fca5a5'
                          : '#ddd',
                    background: detail?.status === 'running' ? '#1a2a3a' : 'transparent',
                  }}
                >
                  <StepIcon detail={detail} />
                  <span style={{ flex: 1 }}>{stepLabel(fs, i)}</span>
                  {detail?.status === 'ok' && (
                    <span style={{ fontSize: 11, color: '#22c55e' }}>done</span>
                  )}
                  {detail?.status === 'failed' && (
                    <span style={{ fontSize: 11, color: '#ef4444' }}>failed</span>
                  )}
                  {detail?.status === 'running' && (
                    <span style={{ fontSize: 11, color: '#3b82f6' }}>running</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {/* Progress bar */}
      {status === 'running' && totalSteps > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              width: '100%',
              height: 6,
              background: '#2a2a2a',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(currentStep / totalSteps) * 100}%`,
                height: '100%',
                background: '#3b82f6',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 12,
            background: '#2a1a1a',
            borderRadius: 8,
            border: '1px solid #ef4444',
            marginBottom: 16,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertCircle size={16} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#fca5a5' }}>Error</span>
          </div>
          <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>{error}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {status === 'idle' && (
          <button
            onClick={onStartTest}
            disabled={testing}
            className="btn"
            style={{
              background: testing ? '#2a2a2a' : '#22c55e',
              opacity: testing ? 0.6 : 1,
              padding: '10px 24px',
              fontSize: 14,
            }}
          >
            <Play size={16} style={{ display: 'inline', marginRight: 8 }} />
            Start Test
          </button>
        )}

        {status === 'succeeded' && runId && (
          <button
            onClick={() => window.open(`/app?run=${runId}`, '_blank')}
            className="btn"
            style={{ background: '#3b82f6', padding: '10px 24px', fontSize: 14 }}
          >
            View Full Results
          </button>
        )}

        {(status === 'succeeded' || status === 'failed') && (
          <button
            onClick={onReset}
            className="btn"
            style={{ background: '#2a2a2a', padding: '10px 24px', fontSize: 14 }}
          >
            Test Again
          </button>
        )}

        <button
          onClick={onClose}
          className="btn"
          style={{
            background: 'none',
            border: '1px solid #2a2a2a',
            padding: '10px 24px',
            fontSize: 14,
          }}
        >
          Close
        </button>
      </div>
    </>
  );
}

export { getStatusIcon };
