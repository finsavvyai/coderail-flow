import type { StepAnalyticsStats, ElementReliabilityStats } from './api';
import './analytics-ext.css';

export function StepPerformanceCard({ stepStats }: { stepStats: StepAnalyticsStats | null }) {
  const topStepTypes = stepStats?.byType?.slice(0, 5) ?? [];
  return (
    <div className="card">
      <div className="h2 analytics-section-title">Step Performance</div>
      {topStepTypes.length === 0 ? (
        <div className="small analytics-text-muted">No step analytics yet.</div>
      ) : (
        <div className="analytics-item-list">
          {topStepTypes.map((step) => {
            const failRate = step.count > 0 ? Math.round((step.failed / step.count) * 100) : 0;
            return (
              <div key={step.type} className="analytics-item-row">
                <div className="analytics-item-header">
                  <span className="analytics-item-name">{step.type}</span>
                  <span className="small analytics-text-muted">{step.count} runs</span>
                </div>
                <div className="small analytics-text-muted">
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
      <div className="h2 analytics-section-title">Element Reliability</div>
      <div className="analytics-badge-row">
        <span className="badge badge--reliability-high">
          High: {elementStats?.summary.high ?? 0}
        </span>
        <span className="badge badge--reliability-medium">
          Medium: {elementStats?.summary.medium ?? 0}
        </span>
        <span className="badge badge--reliability-low">
          Low: {elementStats?.summary.low ?? 0}
        </span>
      </div>
      {lowReliability.length === 0 ? (
        <div className="small analytics-text-muted">No elements tracked yet.</div>
      ) : (
        <div className="analytics-item-list">
          {lowReliability.map((el) => (
            <div key={el.elementId} className="analytics-item-row">
              <div className="analytics-item-header">
                <span className="analytics-item-name">{el.name}</span>
                <span className="small analytics-text-error">
                  {Math.round(el.reliabilityScore * 100)}%
                </span>
              </div>
              <div className="small analytics-text-muted">
                Element: {el.elementId.slice(0, 8)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
