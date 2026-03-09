import { Activity, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof Activity }> = {
  pending: { color: '#a3a3a3', bg: '#a3a3a320', icon: Clock },
  running: { color: '#3b82f6', bg: '#3b82f620', icon: Loader2 },
  succeeded: { color: '#22c55e', bg: '#22c55e20', icon: CheckCircle },
  failed: { color: '#ef4444', bg: '#ef444420', icon: XCircle },
};

const DEFAULT_CONFIG = { color: '#a3a3a3', bg: '#a3a3a320', icon: Activity };

export function RunStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || DEFAULT_CONFIG;
  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 4,
        background: config.bg,
        color: config.color,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Icon size={12} className={status === 'running' ? 'spin' : ''} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
