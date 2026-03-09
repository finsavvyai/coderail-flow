import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { RunProgressStepList } from './RunProgressStepList';
import type { StepProgress } from './RunProgressStepList';

interface RunProgressProps {
  runId: string;
  totalSteps: number;
  onComplete?: (status: 'succeeded' | 'failed') => void;
}

export { RunStatusBadge } from './RunStatusBadge';

export function RunProgress({ runId, totalSteps, onComplete }: RunProgressProps) {
  const [steps, setSteps] = useState<StepProgress[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'pending' | 'running' | 'succeeded' | 'failed'>('pending');
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef(Date.now());
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    const initialSteps: StepProgress[] = Array.from({ length: totalSteps }, (_, i) => ({
      index: i,
      type: 'step',
      status: 'pending',
    }));
    setSteps(initialSteps);
    setStatus('running');
    startTimeRef.current = Date.now();
    void pollProgress();
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 100);
    return () => {
      clearInterval(timer);
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [runId, totalSteps]);

  async function pollProgress() {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_BASE}/runs/${runId}`);
      const data = await res.json();
      if (data.run) {
        if (data.run.status === 'succeeded' || data.run.status === 'failed') {
          setStatus(data.run.status);
          onComplete?.(data.run.status);
          return;
        }
        if (data.run.progress) {
          const progress =
            typeof data.run.progress === 'string'
              ? JSON.parse(data.run.progress)
              : data.run.progress;
          if (progress.currentStep !== undefined) {
            setCurrentStep(progress.currentStep);
            setSteps((prev) =>
              prev.map((step, i) => ({
                ...step,
                status:
                  i < progress.currentStep
                    ? 'completed'
                    : i === progress.currentStep
                      ? 'running'
                      : 'pending',
              }))
            );
          }
        }
      }
      pollingRef.current = window.setTimeout(() => void pollProgress(), 1000);
    } catch (e) {
      console.error('Failed to poll progress:', e);
      pollingRef.current = window.setTimeout(() => void pollProgress(), 2000);
    }
  }

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return minutes > 0 ? `${minutes}:${rem.toString().padStart(2, '0')}` : `${seconds}s`;
  }

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {status === 'running' && (
            <Loader2 size={18} className="spin" style={{ color: '#3b82f6' }} />
          )}
          {status === 'succeeded' && <CheckCircle size={18} style={{ color: '#22c55e' }} />}
          {status === 'failed' && <XCircle size={18} style={{ color: '#ef4444' }} />}
          <span style={{ fontWeight: 500 }}>
            {status === 'running' ? 'Running...' : status === 'succeeded' ? 'Completed' : 'Failed'}
          </span>
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a3a3a3', fontSize: 13 }}
        >
          <Clock size={14} /> {formatTime(elapsedTime)}
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Flow execution progress"
        style={{
          height: 8,
          background: '#2a2a2a',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background:
              status === 'failed' ? '#ef4444' : status === 'succeeded' ? '#22c55e' : '#3b82f6',
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#a3a3a3',
          marginBottom: 16,
        }}
      >
        <span>
          Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      <RunProgressStepList steps={steps} />
    </div>
  );
}
