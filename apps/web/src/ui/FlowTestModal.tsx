import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useFlowTest } from './useFlowTest';
import { FlowTestResults, getStatusIcon } from './FlowTestResults';

interface FlowTestModalProps {
  projectId: string;
  flowDefinition: any;
  flowName: string;
  authProfileId?: string;
  onClose: () => void;
}

export function FlowTestModal({
  projectId,
  flowDefinition,
  flowName,
  authProfileId,
  onClose,
}: FlowTestModalProps) {
  const stepCount = flowDefinition.steps?.length || 0;

  const { testing, runId, status, currentStep, totalSteps, error, stepDetails, startTest, reset } =
    useFlowTest({
      projectId,
      flowDefinition,
      authProfileId,
      stepCount,
    });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Test flow: ${flowName}`}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: 500, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#aaa',
            padding: 10,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
          {getStatusIcon(status)}

          <h2 style={{ margin: '16px 0 8px', fontSize: 20 }}>{flowName}</h2>

          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
            {stepCount} steps • Test run
          </div>

          <FlowTestResults
            status={status}
            currentStep={currentStep}
            totalSteps={totalSteps}
            error={error}
            runId={runId}
            testing={testing}
            stepDetails={stepDetails}
            flowSteps={flowDefinition.steps || []}
            onStartTest={startTest}
            onReset={reset}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
