import { TrendingUp } from 'lucide-react';
import type { AnalyticsStats } from './api';
export { StepPerformanceCard, ElementReliabilityCard } from './AnalyticsChartItems';

export function RunsOverTimeChart({ stats }: { stats: AnalyticsStats }) {
  const maxDayCount = Math.max(...stats.byDay.map((d) => d.count), 1);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div
        className="h2"
        style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <TrendingUp size={18} />
        Runs Over Time
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
        {stats.byDay.map((day, i) => (
          <div
            key={i}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                height: 100,
              }}
            >
              <div
                style={{
                  background: '#22c55e',
                  height: `${(day.succeeded / maxDayCount) * 100}%`,
                  borderRadius: '2px 2px 0 0',
                  minHeight: day.succeeded > 0 ? 2 : 0,
                }}
              />
              <div
                style={{
                  background: '#ef4444',
                  height: `${(day.failed / maxDayCount) * 100}%`,
                  minHeight: day.failed > 0 ? 2 : 0,
                }}
              />
            </div>
            {i % Math.ceil(stats.byDay.length / 7) === 0 && (
              <div style={{ fontSize: 9, color: '#a3a3a3', marginTop: 4 }}>
                {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, background: '#22c55e', borderRadius: 2 }} />
          Succeeded
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }} />
          Failed
        </div>
      </div>
    </div>
  );
}

export function TopFlowsList({ stats }: { stats: AnalyticsStats }) {
  return (
    <div className="card">
      <div className="h2" style={{ marginBottom: 16 }}>
        Top Flows
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stats.byFlow.map((flow, i) => (
          <div
            key={flow.flowId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              background: '#1a1a1a',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{flow.flowName}</div>
              <div style={{ fontSize: 12, color: '#a3a3a3' }}>{flow.count} runs</div>
            </div>
            <div
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                background:
                  flow.successRate >= 90
                    ? '#22c55e20'
                    : flow.successRate >= 70
                      ? '#f59e0b20'
                      : '#ef444420',
                color:
                  flow.successRate >= 90
                    ? '#22c55e'
                    : flow.successRate >= 70
                      ? '#f59e0b'
                      : '#ef4444',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {flow.successRate}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
