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
      <div className="card" style={{ padding: 48, textAlign: 'center', color: '#a3a3a3' }}>
        <Webhook
          size={48}
          strokeWidth={1}
          style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}
        />
        <div style={{ fontSize: 16, marginBottom: 8 }}>No integrations yet</div>
        <div style={{ fontSize: 13 }}>Add Slack, GitLab, GitHub, or webhook integrations</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#a3a3a3', width: 100, flexShrink: 0 }}>{label}:</span>
      <code style={{
        flex: 1, fontSize: 11, color: '#86efac', background: '#0a0a0a',
        padding: '4px 8px', borderRadius: 4, overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {url}
      </code>
      <button className="btn" onClick={() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }} style={{ padding: '8px 12px', fontSize: 10, background: '#1a1a1a', minHeight: 44, minWidth: 44 }} aria-label="Copy webhook URL">
        {copied ? <Check size={10} /> : <Copy size={10} />}
      </button>
    </div>
  );
}

export function WebhookUrls() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{
        fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Globe size={16} /> Incoming Webhook URLs
      </div>
      <div style={{ fontSize: 12, color: '#a3a3a3', marginBottom: 12 }}>
        Use these URLs in your CI/CD pipelines to trigger flows:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <CodeBlock label="GitLab CI" url={`${API_BASE}/triggers/gitlab`} />
        <CodeBlock label="GitHub Actions" url={`${API_BASE}/triggers/github`} />
        <CodeBlock label="Generic (API Key)" url={`${API_BASE}/triggers/run`} />
      </div>
    </div>
  );
}
