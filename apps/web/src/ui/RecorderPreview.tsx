import { ExternalLink } from 'lucide-react';
import type { RecordedAction, RecorderMode } from './FlowRecorder.types';
import { IframePreview, WindowModeView, EmptyPreview } from './PreviewControls';

interface RecorderPreviewProps {
  targetUrl: string;
  isRecording: boolean;
  mode: RecorderMode;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  iframeLoaded: boolean;
  showSubtitleOverlay: boolean;
  activeStepIndex: number | null;
  recordedActions: RecordedAction[];
  onPopOut: () => void;
  serverScreenshot?: string | null;
}

export function RecorderPreview(props: RecorderPreviewProps) {
  const {
    targetUrl,
    isRecording,
    mode,
    iframeRef,
    iframeLoaded,
    showSubtitleOverlay,
    activeStepIndex,
    recordedActions,
    onPopOut,
    serverScreenshot,
  } = props;

  return (
    <div
      className="card"
      style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <PreviewHeader
        targetUrl={targetUrl}
        isRecording={isRecording}
        mode={mode}
        iframeLoaded={iframeLoaded}
        onPopOut={onPopOut}
      />
      <div style={{ flex: 1, background: '#0a0a0a', position: 'relative' }}>
        {targetUrl && isRecording && mode === 'server' ? (
          <ServerModeView screenshot={serverScreenshot} iframeLoaded={iframeLoaded} />
        ) : targetUrl && isRecording && mode === 'iframe' ? (
          <IframePreview
            targetUrl={targetUrl}
            iframeRef={iframeRef}
            showSubtitleOverlay={showSubtitleOverlay}
            activeStepIndex={activeStepIndex}
            recordedActions={recordedActions}
          />
        ) : targetUrl && isRecording && mode === 'window' ? (
          <WindowModeView iframeLoaded={iframeLoaded} />
        ) : (
          <EmptyPreview />
        )}
      </div>
    </div>
  );
}

function ServerModeView({
  screenshot,
  iframeLoaded,
}: {
  screenshot?: string | null;
  iframeLoaded: boolean;
}) {
  if (screenshot) {
    return (
      <img
        src={screenshot}
        alt="Live browser preview"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#666',
        fontSize: 14,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 24 }}>🖥️</div>
      <div>{iframeLoaded ? 'Loading preview…' : 'Launching browser…'}</div>
      <div style={{ fontSize: 11, color: '#555' }}>
        Interact with the Puppeteer browser window to record actions
      </div>
    </div>
  );
}

function PreviewHeader({
  targetUrl,
  isRecording,
  mode,
  iframeLoaded,
  onPopOut,
}: {
  targetUrl: string;
  isRecording: boolean;
  mode: RecorderMode;
  iframeLoaded: boolean;
  onPopOut: () => void;
}) {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#1a1a1a',
        borderBottom: '1px solid #2a2a2a',
        fontSize: 12,
        color: '#a8b3cf',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {targetUrl || 'Enter a URL above to start recording'}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {isRecording && iframeLoaded && <span style={{ color: '#22c55e' }}>Connected</span>}
        {isRecording && mode === 'iframe' && (
          <button
            className="btn"
            onClick={onPopOut}
            title="Pop out to new window"
            style={{ padding: '2px 6px', background: '#2a2a2a', fontSize: 10 }}
          >
            <ExternalLink size={10} /> Pop Out
          </button>
        )}
      </span>
    </div>
  );
}
