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
  const btnStyle = { padding: '6px 10px', fontSize: 11, background: '#1a1a1a' };

  return (
    <div>
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: integ.enabled ? 1 : 0.5,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {info && <info.icon size={20} style={{ color: info.color }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{integ.name}</div>
          <div style={{ fontSize: 12, color: '#a3a3a3' }}>
            {info?.label || integ.type} · {integ.enabled ? 'Active' : 'Disabled'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn"
            onClick={() => onTest(integ.id)}
            disabled={testing === integ.id}
            style={btnStyle}
            title="Send test event"
          >
            {testing === integ.id ? (
              <Check size={12} style={{ color: '#22c55e' }} />
            ) : (
              <TestTube size={12} />
            )}
          </button>
          <button
            className="btn"
            onClick={() => onLoadDeliveries(integ.id)}
            style={btnStyle}
            title="View delivery log"
          >
            {expandedDeliveries === integ.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            className="btn"
            onClick={() => onToggle(integ.id, !integ.enabled)}
            style={{ ...btnStyle, background: integ.enabled ? '#1a1a1a' : '#22c55e' }}
          >
            {integ.enabled ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button
            className="btn"
            onClick={() => onDelete(integ.id)}
            style={{ ...btnStyle, background: '#2a1a1a' }}
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
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderTop: 0,
        borderRadius: '0 0 8px 8px',
        padding: 12,
        maxHeight: 200,
        overflow: 'auto',
      }}
    >
      {deliveries.length === 0 ? (
        <div style={{ color: '#a3a3a3', fontSize: 12, textAlign: 'center', padding: 16 }}>
          No deliveries yet
        </div>
      ) : (
        deliveries.map((d) => (
          <div
            key={d.id}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              padding: '4px 0',
              fontSize: 11,
              borderBottom: '1px solid #1a1a1a',
            }}
          >
            <span style={{ color: d.success ? '#22c55e' : '#ef4444' }}>
              {d.success ? '\u2713' : '\u2717'}
            </span>
            <span style={{ color: '#a3a3a3' }}>{d.event}</span>
            <span style={{ color: '#a3a3a3' }}>HTTP {d.status_code}</span>
            <span style={{ flex: 1 }} />
            <span style={{ color: '#555' }}>{new Date(d.attempted_at).toLocaleString()}</span>
          </div>
        ))
      )}
    </div>
  );
}
