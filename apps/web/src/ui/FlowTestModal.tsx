import { useState } from 'react';
import { Play, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [testing, setTesting] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'succeeded' | 'failed'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepCount = flowDefinition.steps?.length || 0;

  async function handleTest() {
    setTesting(true);
    setStatus('running');
    setCurrentStep(0);
    setTotalSteps(stepCount);
    setError(null);

    try {
      const token = await (window as any).Clerk?.session?.getToken();

      // Create a test run
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          flowId: 'test',
          flowVersion: 1,
          params: {},
          definition: flowDefinition,
          authProfileId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create test run');
      }

      const data = await res.json();
      setRunId(data.runId);

      // Poll for status
      pollRunStatus(data.runId);
    } catch (error: any) {
      setError(error.message || 'Failed to start test');
      setStatus('failed');
      setTesting(false);
      toast.error(error.message || 'Failed to start test');
    }
  }

  async function pollRunStatus(runId: string) {
    try {
      const token = await (window as any).Clerk?.session?.getToken();

      const interval = setInterval(async () => {
        const res = await fetch(`/api/runs/${runId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          clearInterval(interval);
          setStatus('failed');
          setTesting(false);
          return;
        }

        const data = await res.json();
        const run = data.run;

        if (run.status === 'running') {
          setCurrentStep(Math.floor(Math.random() * stepCount) + 1); // Simulate progress
        } else if (run.status === 'succeeded') {
          clearInterval(interval);
          setStatus('succeeded');
          setTesting(false);
          setCurrentStep(stepCount);
          toast.success('Flow test completed successfully!');
        } else if (run.status === 'failed') {
          clearInterval(interval);
          setStatus('failed');
          setError(run.error_message || 'Flow test failed');
          setTesting(false);
          toast.error('Flow test failed');
        }
      }, 1000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(interval), 120000);
    } catch (error: any) {
      setError(error.message || 'Failed to check run status');
      setStatus('failed');
      setTesting(false);
    }
  }

  function getStatusIcon() {
    switch (status) {
      case 'running':
        return <Loader size={48} className="spin" style={{ color: '#3b82f6' }} />;
      case 'succeeded':
        return <CheckCircle size={48} style={{ color: '#22c55e' }} />;
      case 'failed':
        return <XCircle size={48} style={{ color: '#ef4444' }} />;
      default:
        return <Play size={48} style={{ color: '#888' }} />;
    }
  }

  function getStatusText() {
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
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 500,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
            fontSize: 20,
          }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
          {getStatusIcon()}

          <h2 style={{ margin: '16px 0 8px', fontSize: 20 }}>{flowName}</h2>

          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
            {stepCount} steps • Test run
          </div>

          <div
            style={{
              padding: '16px',
              background: status === 'failed' ? '#2a1a1a' : '#1a1a1a',
              borderRadius: 8,
              border: `1px solid ${status === 'failed' ? '#ef4444' : '#2a2a2a'}`,
              marginBottom: 24,
              minHeight: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 500 }}>{getStatusText()}</div>
          </div>

          {error && (
            <div
              style={{
                padding: 12,
                background: '#2a1a1a',
                borderRadius: 8,
                border: '1px solid #ef4444',
                marginBottom: 24,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={16} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#ff9aa2' }}>Error</span>
              </div>
              <div style={{ fontSize: 12, color: '#ff9aa2', lineHeight: 1.5 }}>{error}</div>
            </div>
          )}

          {status === 'running' && (
            <div style={{ marginBottom: 24 }}>
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

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {status === 'idle' && (
              <button
                onClick={handleTest}
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
                onClick={() => {
                  window.open(`/app?run=${runId}`, '_blank');
                }}
                className="btn"
                style={{
                  background: '#3b82f6',
                  padding: '10px 24px',
                  fontSize: 14,
                }}
              >
                View Full Results
              </button>
            )}

            {(status === 'succeeded' || status === 'failed') && (
              <button
                onClick={() => {
                  setStatus('idle');
                  setCurrentStep(0);
                  setError(null);
                }}
                className="btn"
                style={{
                  background: '#2a2a2a',
                  padding: '10px 24px',
                  fontSize: 14,
                }}
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
        </div>
      </div>
    </div>
  );
}
