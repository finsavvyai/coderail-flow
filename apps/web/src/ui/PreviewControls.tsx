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

  return (
    <>
      <iframe
        ref={iframeRef}
        src={getProxyUrl(targetUrl)}
        style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
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
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 24px 20px',
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 500,
          lineHeight: 1.5,
          textAlign: 'center',
          maxWidth: '80%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          animation: 'subtitleFadeIn 0.3s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <MessageSquare size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
          <span>{subtitle}</span>
        </div>
        {totalSteps > 1 && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Step {(activeStepIndex ?? 0) + 1} of {totalSteps}
          </div>
        )}
      </div>
    </div>
  );
}

export function WindowModeView({ iframeLoaded }: { iframeLoaded: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#a3a3a3',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.1)',
          border: '2px solid #3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Maximize2 size={32} style={{ color: '#3b82f6' }} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 500 }}>Recording in separate window</div>
      <div style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', maxWidth: 360 }}>
        Interact with your site in the popup window.
        <br />
        Actions are recorded here in real-time.
        <br />
        Click <strong style={{ color: '#ef4444' }}>Stop</strong> when done.
      </div>
      {iframeLoaded && (
        <div
          style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
            }}
          />
          Connected — receiving events
        </div>
      )}
    </div>
  );
}

export function EmptyPreview() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#a3a3a3',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <MousePointer size={48} strokeWidth={1} />
      <div>Enter a URL and click "Start Recording"</div>
      <div style={{ fontSize: 12, color: '#444' }}>
        Your clicks, inputs, and navigation will be captured
      </div>
    </div>
  );
}
