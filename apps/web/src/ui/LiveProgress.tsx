import React, { useEffect, useState } from 'react';
import { getRun } from './api';

export type ProgressState = {
  step: number;
  total: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  description?: string;
  percentage: number;
};

type LiveProgressProps = {
  runId: string;
  onComplete?: () => void;
};

const BADGE_CLASS: Record<string, string> = {
  queued: 'badge lp-badge-queued',
  running: 'badge lp-badge-running',
  succeeded: 'badge lp-badge-succeeded',
  failed: 'badge lp-badge-failed',
};

const BAR_CLASS: Record<string, string> = {
  queued: 'lp-bar-fill lp-bar-fill--queued',
  running: 'lp-bar-fill lp-bar-fill--running',
  succeeded: 'lp-bar-fill lp-bar-fill--succeeded',
  failed: 'lp-bar-fill lp-bar-fill--failed',
};

export function LiveProgress({ runId, onComplete }: LiveProgressProps) {
  const [progress, setProgress] = useState<ProgressState>({
    step: 0,
    total: 0,
    status: 'queued',
    percentage: 0,
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const pollProgress = async () => {
      try {
        const data = await getRun(runId);
        const run = data.run;

        const screenshots = (data.artifacts || []).filter((a: any) =>
          a.kind?.startsWith('screenshot')
        );
        const step = screenshots.length;
        const status = run.status;

        setProgress({
          step,
          total: step > 0 ? step : 0,
          status,
          description: getStatusDescription(status, step),
          percentage:
            status === 'succeeded'
              ? 100
              : status === 'failed'
                ? 0
                : step > 0
                  ? (step / 13) * 100
                  : 0,
        });

        if (status === 'succeeded' || status === 'failed') {
          if (interval) clearInterval(interval);
          if (onComplete) onComplete();
        }
      } catch (err) {
        console.error('Failed to poll progress:', err);
      }
    };

    void pollProgress();

    if (progress.status !== 'succeeded' && progress.status !== 'failed') {
      interval = setInterval(() => void pollProgress(), 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runId, onComplete, progress.status]);

  const badgeClass = BADGE_CLASS[progress.status] || BADGE_CLASS.queued;
  const barFillClass = BAR_CLASS[progress.status] || BAR_CLASS.queued;

  return (
    <div className="lp-wrapper">
      <div className="lp-header">
        <div>
          <span className={badgeClass}>{progress.status}</span>
          {progress.step > 0 && (
            <span className="small lp-step-info">
              Step {progress.step} {progress.total > 0 ? `of ${progress.total}` : ''}
            </span>
          )}
        </div>
        <div className="small">{Math.round(progress.percentage)}%</div>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress.percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Flow execution progress"
        className="lp-bar-track"
      >
        <div className={barFillClass} style={{ width: `${progress.percentage}%` }} />
      </div>

      {/* Description */}
      {progress.description && <div className="small lp-description">{progress.description}</div>}
    </div>
  );
}

function getStatusDescription(status: string, step: number): string {
  switch (status) {
    case 'queued':
      return 'Waiting to start...';
    case 'running':
      return step > 0 ? `Executing step ${step}...` : 'Starting execution...';
    case 'succeeded':
      return 'Execution completed successfully!';
    case 'failed':
      return 'Execution failed. Check error details below.';
    default:
      return 'Unknown status';
  }
}
