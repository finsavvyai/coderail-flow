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

        // Calculate progress based on artifacts (screenshots indicate completed steps)
        const screenshots = (data.artifacts || []).filter((a: any) =>
          a.kind?.startsWith('screenshot')
        );
        const step = screenshots.length;

        // Estimate total from flow definition or default to unknown
        // For now, we'll show progress as we go
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

        // If complete, stop polling
        if (status === 'succeeded' || status === 'failed') {
          if (interval) clearInterval(interval);
          if (onComplete) onComplete();
        }
      } catch (err) {
        console.error('Failed to poll progress:', err);
      }
    };

    // Poll immediately
    pollProgress();

    // Then poll every 1 second while running
    if (progress.status !== 'succeeded' && progress.status !== 'failed') {
      interval = setInterval(pollProgress, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runId, onComplete, progress.status]);

  return (
    <div style={{ marginTop: 16, marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div>
          <span
            className="badge"
            style={{
              backgroundColor: getStatusColor(progress.status),
              color: '#fff',
            }}
          >
            {progress.status}
          </span>
          {progress.step > 0 && (
            <span className="small" style={{ marginLeft: 8 }}>
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
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#2a2a2a',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress.percentage}%`,
            height: '100%',
            backgroundColor: getStatusColor(progress.status),
            transition: 'width 0.3s ease',
          }}
        ></div>
      </div>

      {/* Description */}
      {progress.description && (
        <div className="small" style={{ marginTop: 8, color: '#a8b3cf' }}>
          {progress.description}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'succeeded':
      return '#22c55e';
    case 'failed':
      return '#f44336';
    case 'running':
      return '#3b82f6';
    case 'queued':
      return '#6b7280';
    default:
      return '#6b7280';
  }
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
