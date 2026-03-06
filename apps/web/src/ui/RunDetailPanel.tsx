import React, { useMemo, useState } from 'react';
import { LiveProgress } from './LiveProgress';
import { ScreenshotGallery } from './ScreenshotGallery';
import { ErrorDisplay } from './ErrorDisplay';
import { VideoPlayer } from './VideoPlayer';
import { ShareToSlackModal } from './ShareToSlackModal';
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
  const [copiedState, setCopiedState] = useState<'link' | 'summary' | null>(null);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const run = runDetail?.run ?? null;
  const runUrl = useMemo(() => {
    if (!selectedRun || typeof window === 'undefined') return '';
    return `${window.location.origin}/app?run=${selectedRun}`;
  }, [selectedRun]);
  const runSummary = useMemo(() => {
    if (!run) return '';
    const artifactCount = Array.isArray(runDetail?.artifacts) ? runDetail.artifacts.length : 0;
    const durationSeconds =
      run.finished_at && run.started_at
        ? Math.max(
            0,
            Math.round(
              (new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000,
            ),
          )
        : null;

    return [
      `CodeRail Flow run ${run.id.slice(0, 8)} for ${run.flow_name ?? run.flow_id ?? 'selected flow'} is ${run.status}.`,
      durationSeconds !== null ? `Duration: ${durationSeconds}s.` : '',
      `${artifactCount} artifact${artifactCount === 1 ? '' : 's'} captured.`,
      runUrl ? `Open run: ${runUrl}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [run, runDetail?.artifacts, runUrl]);

  async function handleCopy(type: 'link' | 'summary') {
    const text = type === 'link' ? runUrl : runSummary;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(type);
      window.setTimeout(() => setCopiedState(null), 2000);
    } catch (error) {
      console.error(`Failed to copy ${type}:`, error);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="h2">Selected run</div>

      {/* Live Progress */}
      {showProgress && selectedRun && (
        <LiveProgress runId={selectedRun} onComplete={onProgressComplete} />
      )}

      {run && (
        <div
          className="card"
          style={{
            marginTop: 12,
            border: '1px solid rgba(43, 124, 255, 0.28)',
            background: 'linear-gradient(135deg, rgba(43, 124, 255, 0.15), rgba(43, 124, 255, 0.04))',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 720 }}>
              <div className="small" style={{ color: '#8fb8ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Share this run
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: '#d6e4ff', marginTop: 8 }}>
                {runSummary}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => handleCopy('link')}>
                {copiedState === 'link' ? 'Copied link' : 'Copy run link'}
              </button>
              <button className="btn" onClick={() => handleCopy('summary')}>
                {copiedState === 'summary' ? 'Copied summary' : 'Copy run summary'}
              </button>
              <button
                className="btn"
                onClick={() => setShowSlackModal(true)}
                style={{ background: '#4A154B' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ display: 'inline', marginRight: 6 }}
                >
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
                Share to Slack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {runDetail?.run?.status === 'failed' && (
        <ErrorDisplay
          run={runDetail.run}
          errorScreenshot={runDetail.artifacts?.find((a: any) => a.kind?.startsWith('screenshot'))}
          onRetry={onRetry}
        />
      )}

      {/* Video-first playback */}
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

      {/* Run Details */}
      <div className="h2" style={{ marginTop: 12 }}>
        Run Details
      </div>
      <pre className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>
        {runDetail ? JSON.stringify(runDetail.run, null, 2) : 'Select a run'}
      </pre>

      {/* Other Artifacts */}
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

      {/* Slack Share Modal */}
      {showSlackModal && run && (
        <ShareToSlackModal
          flowId={run.flow_id}
          flowName={run.flow_name || 'Untitled Flow'}
          runId={selectedRun}
          onClose={() => setShowSlackModal(false)}
        />
      )}
    </div>
  );
}
