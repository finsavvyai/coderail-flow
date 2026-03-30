import { Maximize2, MousePointer, MessageSquare } from 'lucide-react';
import type { RecordedAction } from './FlowRecorder.types';
import { getProxyUrl } from './FlowRecorder.utils';

interface IframePreviewProps {
  targetUrl: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  showSubtitleOverlay: boolean;
  activeStepIndex: number | null;
  recordedActions: RecordedAction[];
}

export function IframePreview({
  targetUrl,
  iframeRef,
  showSubtitleOverlay,
  activeStepIndex,
  recordedActions,
}: IframePreviewProps) {
  const subtitle =
    activeStepIndex !== null ? recordedActions[activeStepIndex]?.subtitle : undefined;
  const proxyUrl = getProxyUrl(targetUrl);

  if (!proxyUrl) {
    return (
      <div className="preview-empty-state">
        Configure `VITE_API_URL` so the recorder proxy can load this page.
      </div>
    );
  }

  return (
    <>
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        className="preview-iframe"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
      {showSubtitleOverlay && subtitle && (
        <SubtitleOverlay
          subtitle={subtitle}
          activeStepIndex={activeStepIndex}
          totalSteps={recordedActions.length}
        />
      )}
    </>
  );
}

function SubtitleOverlay({
  subtitle,
  activeStepIndex,
  totalSteps,
}: {
  subtitle: string;
  activeStepIndex: number | null;
  totalSteps: number;
}) {
  return (
    <div className="preview-subtitle-wrapper">
      <div className="preview-subtitle-box">
        <div className="preview-subtitle-content">
          <MessageSquare size={14} className="preview-subtitle-icon" />
          <span>{subtitle}</span>
        </div>
        {totalSteps > 1 && (
          <div className="preview-subtitle-step">
            Step {(activeStepIndex ?? 0) + 1} of {totalSteps}
          </div>
        )}
      </div>
    </div>
  );
}

export function WindowModeView({ iframeLoaded }: { iframeLoaded: boolean }) {
  return (
    <div className="preview-window-mode">
      <div className="preview-window-icon">
        <Maximize2 size={32} className="preview-icon-accent" />
      </div>
      <div className="preview-window-title">Recording in separate window</div>
      <div className="preview-window-desc">
        Interact with your site in the popup window.
        <br />
        Actions are recorded here in real-time.
        <br />
        Click <strong className="preview-stop-label">Stop</strong> when done.
      </div>
      {iframeLoaded && (
        <div className="preview-connected-status">
          <span className="preview-connected-dot" />
          Connected — receiving events
        </div>
      )}
    </div>
  );
}

export function EmptyPreview() {
  return (
    <div className="preview-empty-placeholder">
      <MousePointer size={48} strokeWidth={1} />
      <div>Enter a URL and click "Start Recording"</div>
      <div className="preview-empty-hint">
        Your clicks, inputs, and navigation will be captured
      </div>
    </div>
  );
}
