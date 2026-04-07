import { ExternalLink, Monitor } from 'lucide-react';
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
    <div className="card recorder-preview-card">
      <PreviewHeader
        targetUrl={targetUrl}
        isRecording={isRecording}
        mode={mode}
        iframeLoaded={iframeLoaded}
        onPopOut={onPopOut}
      />
      <div className="recorder-preview-viewport">
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
    return <img src={screenshot} alt="Live browser preview" className="recorder-preview-img" />;
  }
  return (
    <div className="recorder-preview-placeholder">
      <Monitor size={24} />
      <div>{iframeLoaded ? 'Loading preview…' : 'Launching browser…'}</div>
      <div className="recorder-preview-hint">
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
    <div className="recorder-preview-header">
      <span className="recorder-preview-url">
        {targetUrl || 'Enter a URL above to start recording'}
      </span>
      <span className="recorder-preview-status">
        {isRecording && iframeLoaded && <span className="recorder-connected">Connected</span>}
        {isRecording && mode === 'iframe' && (
          <button
            className="btn recorder-popout-btn"
            onClick={onPopOut}
            title="Pop out to new window"
          >
            <ExternalLink size={10} /> Pop Out
          </button>
        )}
      </span>
    </div>
  );
}
