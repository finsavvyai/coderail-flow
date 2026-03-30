import { Trash2, TestTube, Check, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { Integration, Delivery } from './integrations-types';
import { getTypeInfo } from './integrations-types';

interface IntegrationCardProps {
  integ: Integration;
  testing: string | null;
  expandedDeliveries: string | null;
  deliveries: Delivery[];
  onTest: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onLoadDeliveries: (id: string) => void;
}

export function IntegrationCard({
  integ,
  testing,
  expandedDeliveries,
  deliveries,
  onTest,
  onToggle,
  onDelete,
  onLoadDeliveries,
}: IntegrationCardProps) {
  const info = getTypeInfo(integ.type);

  return (
    <div>
      <div
        className={`card integ-card${integ.enabled ? '' : ' integ-card--disabled'}`}
      >
        <div className="integ-icon-box">
          {info && <info.icon size={20} style={{ color: info.color }} />}
        </div>
        <div className="integ-meta">
          <div className="integ-name">{integ.name}</div>
          <div className="integ-subtitle">
            {info?.label || integ.type} · {integ.enabled ? 'Active' : 'Disabled'}
          </div>
        </div>
        <div className="integ-actions">
          <button
            className="btn integ-action-btn"
            onClick={() => onTest(integ.id)}
            disabled={testing === integ.id}
            title="Send test event"
          >
            {testing === integ.id ? (
              <Check size={12} className="integ-check-icon" />
            ) : (
              <TestTube size={12} />
            )}
          </button>
          <button
            className="btn integ-action-btn"
            onClick={() => onLoadDeliveries(integ.id)}
            title="View delivery log"
          >
            {expandedDeliveries === integ.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            className={`btn integ-action-btn${integ.enabled ? '' : ' integ-action-btn--toggle-on'}`}
            onClick={() => onToggle(integ.id, !integ.enabled)}
          >
            {integ.enabled ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button
            className="btn integ-action-btn integ-action-btn--delete"
            onClick={() => onDelete(integ.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {expandedDeliveries === integ.id && <DeliveryLog deliveries={deliveries} />}
    </div>
  );
}

function DeliveryLog({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <div className="delivery-log">
      {deliveries.length === 0 ? (
        <div className="delivery-empty">No deliveries yet</div>
      ) : (
        deliveries.map((d) => (
          <div key={d.id} className="delivery-row">
            <span className={d.success ? 'delivery-ok' : 'delivery-fail'}>
              {d.success ? '\u2713' : '\u2717'}
            </span>
            <span className="delivery-detail">{d.event}</span>
            <span className="delivery-detail">HTTP {d.status_code}</span>
            <span className="delivery-spacer" />
            <span className="delivery-time">{new Date(d.attempted_at).toLocaleString()}</span>
          </div>
        ))
      )}
    </div>
  );
}
