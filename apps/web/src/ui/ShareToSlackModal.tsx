import { useState, useEffect } from 'react';
import { Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { SlackMessagePreview } from './SlackMessagePreview';
import { apiUrl, getApiToken } from './api-core';

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
      const token = await getApiToken();
      const payload: any = {
        channel,
        message,
        flowUrl,
        flowName,
        includeScreenshot,
        includeVideo,
      };
      if (runId) {
        payload.runId = runId;
        payload.runUrl = runUrl;
      }
      const res = await fetch(apiUrl('/integrations/slack/share'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    void navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="slack-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share to Slack"
    >
      <div
        className="card slack-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="slack-modal-close"
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

        <div className="slack-modal-actions">
          <button
            type="button"
            onClick={copyToClipboard}
            className="btn slack-btn-copy"
          >
            <Copy size={14} style={{ display: 'inline', marginRight: 6 }} />
            Copy Link
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={loading}
            className="btn slack-btn-share"
          >
            {loading ? 'Sharing...' : 'Share to Slack'}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="slack-btn-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function SlackModalHeader() {
  return (
    <div className="slack-modal-header">
      <div className="slack-modal-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
      </div>
      <h2 className="slack-modal-title">Share to Slack</h2>
      <div className="slack-modal-subtitle">
        Share flow results with your team
      </div>
    </div>
  );
}
