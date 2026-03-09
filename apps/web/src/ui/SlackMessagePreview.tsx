import { AlertCircle } from 'lucide-react';

interface SlackMessagePreviewProps {
  channel: string;
  setChannel: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  includeScreenshot: boolean;
  setIncludeScreenshot: (v: boolean) => void;
  includeVideo: boolean;
  setIncludeVideo: (v: boolean) => void;
  runId?: string;
}

export function SlackMessagePreview({
  channel,
  setChannel,
  message,
  setMessage,
  includeScreenshot,
  setIncludeScreenshot,
  includeVideo,
  setIncludeVideo,
  runId,
}: SlackMessagePreviewProps) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="slack-channel"
          style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}
        >
          Channel
        </label>
        <input
          id="slack-channel"
          className="input"
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="#coderail-flows"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="slack-message"
          style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}
        >
          Message
        </label>
        <textarea
          id="slack-message"
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Check out this flow..."
          style={{ minHeight: 80, resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
          Attachments
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          <input
            type="checkbox"
            checked={includeScreenshot}
            onChange={(e) => setIncludeScreenshot(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          <span style={{ fontSize: 13 }}>Include screenshot</span>
        </label>
        {runId && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeVideo}
              onChange={(e) => setIncludeVideo(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: 13 }}>Include video recording</span>
          </label>
        )}
      </div>

      <div
        style={{
          padding: 12,
          background: '#0a1628',
          borderRadius: 8,
          border: '1px solid #4A154B',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <AlertCircle size={16} style={{ color: '#4A154B' }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#4A154B' }}>
            Slack Integration Required
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#a3a3a3', lineHeight: 1.5 }}>
          You need to configure a Slack integration first. Go to Settings → Integrations → Add
          Integration → Slack.
        </div>
      </div>
    </>
  );
}
