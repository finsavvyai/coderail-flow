import { Activity, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

const STATUS_ICON: Record<string, typeof Activity> = {
  pending: Clock,
  running: Loader2,
  succeeded: CheckCircle,
  failed: XCircle,
};

const STATUS_CLASS: Record<string, string> = {
  pending: 'rsb rsb--pending',
  running: 'rsb rsb--running',
  succeeded: 'rsb rsb--succeeded',
  failed: 'rsb rsb--failed',
};

export function RunStatusBadge({ status }: { status: string }) {
  const Icon = STATUS_ICON[status] || Activity;
  const className = STATUS_CLASS[status] || 'rsb rsb--pending';

  return (
    <span className={className}>
      <Icon size={12} className={status === 'running' ? 'spin' : ''} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
