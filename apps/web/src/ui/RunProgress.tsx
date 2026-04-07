import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { RunProgressStepList } from './RunProgressStepList';
import type { StepProgress } from './RunProgressStepList';
import { apiUrl } from './api-core';

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
      const res = await fetch(apiUrl(`/runs/${runId}`));
      const data = (await res.json()) as { run?: { status: string; progress?: any } };
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

  const barClass = `rp-bar-fill rp-bar-fill--${status === 'failed' ? 'failed' : status === 'succeeded' ? 'succeeded' : 'running'}`;

  return (
    <div className="card">
      <div className="rp-header">
        <div className="rp-status-group">
          {status === 'running' && <Loader2 size={18} className="spin ftr-status-icon-accent" />}
          {status === 'succeeded' && <CheckCircle size={18} className="ftr-status-icon-success" />}
          {status === 'failed' && <XCircle size={18} className="ftr-status-icon-error" />}
          <span className="rp-status-label">
            {status === 'running' ? 'Running...' : status === 'succeeded' ? 'Completed' : 'Failed'}
          </span>
        </div>
        <div className="rp-timer">
          <Clock size={14} /> {formatTime(elapsedTime)}
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Flow execution progress"
        className="rp-bar-track"
      >
        <div className={barClass} style={{ width: `${progress}%` }} />
      </div>

      <div className="rp-meta">
        <span>
          Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      <RunProgressStepList steps={steps} />
    </div>
  );
}
