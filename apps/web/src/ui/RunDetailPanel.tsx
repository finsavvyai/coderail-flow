import React from 'react';
import { LiveProgress } from './LiveProgress';
import { ScreenshotGallery } from './ScreenshotGallery';
import { ErrorDisplay } from './ErrorDisplay';
import { VideoPlayer } from './VideoPlayer';
import { RunShareCard } from './RunShareCard';
import { artifactDownloadUrl } from './api';

interface RunDetailPanelProps {
  selectedRun: string;
  runDetail: any;
  showProgress: boolean;
  videoArtifact: any;
  screenshotArtifacts: any[];
  subtitleArtifact: any;
  onProgressComplete: () => void;
  onRetry: () => void;
}

export function RunDetailPanel({
  selectedRun,
  runDetail,
  showProgress,
  videoArtifact,
  screenshotArtifacts,
  subtitleArtifact,
  onProgressComplete,
  onRetry,
}: RunDetailPanelProps) {
  const run = runDetail?.run ?? null;

  return (
    <div style={{ marginTop: 12 }}>
      <div className="h2">Selected run</div>

      {showProgress && selectedRun && (
        <LiveProgress runId={selectedRun} onComplete={onProgressComplete} />
      )}

      {run && (
        <RunShareCard
          run={run}
          selectedRun={selectedRun}
          artifacts={runDetail?.artifacts}
        />
      )}

      {runDetail?.run?.status === 'failed' && (
        <ErrorDisplay
          run={runDetail.run}
          errorScreenshot={runDetail.artifacts?.find((a: any) => a.kind?.startsWith('screenshot'))}
          onRetry={onRetry}
        />
      )}

      {videoArtifact ? (
        <>
          <div className="h2" style={{ marginTop: 12 }}>
            Recording
          </div>
          <VideoPlayer artifactId={videoArtifact.id} subtitleArtifactId={subtitleArtifact?.id} />
        </>
      ) : screenshotArtifacts.length > 0 ? (
        <>
          <div className="h2" style={{ marginTop: 12 }}>
            Screenshots
          </div>
          <ScreenshotGallery screenshots={screenshotArtifacts} />
        </>
      ) : null}

      <div className="h2" style={{ marginTop: 12 }}>
        Run Details
      </div>
      <pre className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>
        {runDetail ? JSON.stringify(runDetail.run, null, 2) : 'Select a run'}
      </pre>

      {runDetail?.artifacts?.length ? (
        <>
          <div className="h2" style={{ marginTop: 12 }}>
            Artifacts
          </div>
          {runDetail.artifacts.map((a: any) => (
            <div
              key={a.id}
              className="row"
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div className="small">
                <span className="badge">{a.kind}</span>{' '}
                <span className="mono">{a.id.slice(0, 8)}...</span>
              </div>
              <a className="btn" href={artifactDownloadUrl(a.id)} target="_blank" rel="noreferrer">
                Download
              </a>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}
