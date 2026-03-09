import type { StepAnalyticsStats, ElementReliabilityStats } from './api';

export function StepPerformanceCard({ stepStats }: { stepStats: StepAnalyticsStats | null }) {
  const topStepTypes = stepStats?.byType?.slice(0, 5) ?? [];
  return (
    <div className="card">
      <div className="h2" style={{ marginBottom: 12 }}>
        Step Performance
      </div>
      {topStepTypes.length === 0 ? (
        <div className="small" style={{ color: '#a8b3cf' }}>
          No step analytics yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topStepTypes.map((step) => {
            const failRate = step.count > 0 ? Math.round((step.failed / step.count) * 100) : 0;
            return (
              <div key={step.type} style={{ background: '#1a1a1a', borderRadius: 8, padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{step.type}</span>
                  <span className="small" style={{ color: '#a8b3cf' }}>
                    {step.count} runs
                  </span>
                </div>
                <div className="small" style={{ color: '#a8b3cf' }}>
                  Avg {Math.max(0, step.avgDurationMs)}ms / Fail rate {failRate}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ElementReliabilityCard({
  elementStats,
}: {
  elementStats: ElementReliabilityStats | null;
}) {
  const lowReliability = elementStats?.lowest?.slice(0, 5) ?? [];
  return (
    <div className="card">
      <div className="h2" style={{ marginBottom: 12 }}>
        Element Reliability
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <span className="badge" style={{ background: '#22c55e22', color: '#22c55e' }}>
          High: {elementStats?.summary.high ?? 0}
        </span>
        <span className="badge" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
          Medium: {elementStats?.summary.medium ?? 0}
        </span>
        <span className="badge" style={{ background: '#ef444422', color: '#ef4444' }}>
          Low: {elementStats?.summary.low ?? 0}
        </span>
      </div>
      {lowReliability.length === 0 ? (
        <div className="small" style={{ color: '#a8b3cf' }}>
          No elements tracked yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lowReliability.map((el) => (
            <div key={el.elementId} style={{ background: '#1a1a1a', borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{el.name}</span>
                <span className="small" style={{ color: '#ef4444' }}>
                  {Math.round(el.reliabilityScore * 100)}%
                </span>
              </div>
              <div className="small" style={{ color: '#a8b3cf' }}>
                Element: {el.elementId.slice(0, 8)}…
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
