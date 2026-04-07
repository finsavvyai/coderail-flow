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
      <div className="slack-field-group">
        <label htmlFor="slack-channel" className="slack-field-label">
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

      <div className="slack-field-group">
        <label htmlFor="slack-message" className="slack-field-label">
          Message
        </label>
        <textarea
          id="slack-message"
          className="input slack-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Check out this flow..."
        />
      </div>

      <div className="slack-field-group--lg">
        <label className="slack-field-label slack-field-label--attach">Attachments</label>
        <label className="slack-checkbox-label">
          <input
            type="checkbox"
            checked={includeScreenshot}
            onChange={(e) => setIncludeScreenshot(e.target.checked)}
            className="slack-checkbox"
          />
          <span className="slack-checkbox-text">Include screenshot</span>
        </label>
        {runId && (
          <label className="slack-checkbox-label">
            <input
              type="checkbox"
              checked={includeVideo}
              onChange={(e) => setIncludeVideo(e.target.checked)}
              className="slack-checkbox"
            />
            <span className="slack-checkbox-text">Include video recording</span>
          </label>
        )}
      </div>

      <div className="slack-integration-box">
        <div className="slack-integration-header">
          <AlertCircle size={16} className="slack-integration-icon" />
          <span className="slack-integration-title">Slack Integration Required</span>
        </div>
        <div className="slack-integration-body">
          You need to configure a Slack integration first. Go to Settings → Integrations → Add
          Integration → Slack.
        </div>
      </div>
    </>
  );
}
