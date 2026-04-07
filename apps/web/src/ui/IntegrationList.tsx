import { useState } from 'react';
import { Webhook, Check, Copy, Globe } from 'lucide-react';
import type { Integration, Delivery } from './integrations-types';
import { API_BASE } from './integrations-types';
import { IntegrationCard } from './IntegrationCard';

interface IntegrationListProps {
  integrations: Integration[];
  testing: string | null;
  expandedDeliveries: string | null;
  deliveries: Delivery[];
  onTest: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onLoadDeliveries: (id: string) => void;
}

export function IntegrationList({
  integrations,
  testing,
  expandedDeliveries,
  deliveries,
  onTest,
  onToggle,
  onDelete,
  onLoadDeliveries,
}: IntegrationListProps) {
  if (integrations.length === 0) {
    return (
      <div className="card integ-empty">
        <Webhook size={48} strokeWidth={1} className="integ-empty-icon" />
        <div className="integ-empty-title">No integrations yet</div>
        <div className="integ-empty-hint">Add Slack, GitLab, GitHub, or webhook integrations</div>
      </div>
    );
  }

  return (
    <div className="integ-list">
      {integrations.map((integ) => (
        <IntegrationCard
          key={integ.id}
          integ={integ}
          testing={testing}
          expandedDeliveries={expandedDeliveries}
          deliveries={deliveries}
          onTest={onTest}
          onToggle={onToggle}
          onDelete={onDelete}
          onLoadDeliveries={onLoadDeliveries}
        />
      ))}
    </div>
  );
}

function CodeBlock({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="codeblock-row">
      <span className="codeblock-label">{label}:</span>
      <code className="codeblock-value">{url}</code>
      <button
        className="btn codeblock-copy-btn"
        onClick={() => {
          void navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copy webhook URL"
      >
        {copied ? <Check size={10} /> : <Copy size={10} />}
      </button>
    </div>
  );
}

export function WebhookUrls() {
  return (
    <div className="card webhook-card">
      <div className="webhook-header">
        <Globe size={16} /> Incoming Webhook URLs
      </div>
      <div className="webhook-hint">Use these URLs in your CI/CD pipelines to trigger flows:</div>
      <div className="webhook-urls">
        <CodeBlock label="GitLab CI" url={`${API_BASE}/triggers/gitlab`} />
        <CodeBlock label="GitHub Actions" url={`${API_BASE}/triggers/github`} />
        <CodeBlock label="Generic (API Key)" url={`${API_BASE}/triggers/run`} />
      </div>
    </div>
  );
}
