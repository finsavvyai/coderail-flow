import { useState, useEffect } from 'react';
import { Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { SlackMessagePreview } from './SlackMessagePreview';

interface ShareToSlackModalProps {
  flowId: string;
  flowName: string;
  runId?: string;
  onClose: () => void;
}

export function ShareToSlackModal({ flowId, flowName, runId, onClose }: ShareToSlackModalProps) {
  const [channel, setChannel] = useState('#coderail-flows');
  const [message, setMessage] = useState(`Check out this flow: ${flowName}`);
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  const flowUrl = `${window.location.origin}/flows/${flowId}`;
  const runUrl = runId ? `${window.location.origin}/runs/${runId}` : null;

  async function handleShare() {
    setLoading(true);
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const payload: any = {
        channel, message, flowUrl, flowName, includeScreenshot, includeVideo,
      };
      if (runId) {
        payload.runId = runId;
        payload.runUrl = runUrl;
      }
      const res = await fetch('/api/integrations/slack/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to share to Slack');
      }
      toast.success('Shared to Slack successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to share to Slack');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    const text = `${message}\n\n${flowUrl}${runUrl ? `\n\nRun: ${runUrl}` : ''}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share to Slack"
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: 500, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
            padding: 10, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <SlackModalHeader />

        <SlackMessagePreview
          channel={channel}
          setChannel={setChannel}
          message={message}
          setMessage={setMessage}
          includeScreenshot={includeScreenshot}
          setIncludeScreenshot={setIncludeScreenshot}
          includeVideo={includeVideo}
          setIncludeVideo={setIncludeVideo}
          runId={runId}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={copyToClipboard}
            className="btn"
            style={{ flex: 1, background: '#2a2a2a' }}
          >
            <Copy size={14} style={{ display: 'inline', marginRight: 6 }} />
            Copy Link
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={loading}
            className="btn"
            style={{
              flex: 1, background: loading ? '#2a2a2a' : '#4A154B',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Sharing...' : 'Share to Slack'}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 12, width: '100%', padding: '8px 16px',
            background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function SlackModalHeader() {
  return (
    <div style={{ marginBottom: 24, textAlign: 'center' }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: 12, background: '#4A154B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
      </div>
      <h2 style={{ margin: 0, fontSize: 20 }}>Share to Slack</h2>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
        Share flow results with your team
      </div>
    </div>
  );
}
