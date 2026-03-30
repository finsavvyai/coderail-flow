import { TrendingUp } from 'lucide-react';
import type { AnalyticsStats } from './api';
export { StepPerformanceCard, ElementReliabilityCard } from './AnalyticsChartItems';

function successRateClass(rate: number) {
  if (rate >= 90) return 'rate-good';
  if (rate >= 70) return 'rate-warn';
  return 'rate-bad';
}

export function RunsOverTimeChart({ stats }: { stats: AnalyticsStats }) {
  const maxDayCount = Math.max(...stats.byDay.map((d) => d.count), 1);

  return (
    <div className="card analytics-chart-card">
      <div className="analytics-chart-title">
        <TrendingUp size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Runs Over Time
      </div>
      <div className="analytics-bar-chart">
        {stats.byDay.map((day, i) => (
          <div key={i} className="analytics-bar-col">
            <div className="analytics-bar-stack">
              <div
                className="analytics-bar analytics-bar-success"
                style={{
                  height: `${(day.succeeded / maxDayCount) * 100}%`,
                  minHeight: day.succeeded > 0 ? 2 : 0,
                }}
              />
              <div
                className="analytics-bar analytics-bar-fail"
                style={{
                  height: `${(day.failed / maxDayCount) * 100}%`,
                  minHeight: day.failed > 0 ? 2 : 0,
                }}
              />
            </div>
            {i % Math.ceil(stats.byDay.length / 7) === 0 && (
              <div className="analytics-bar-label">
                {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="analytics-legend">
        <div>
          <span className="analytics-legend-dot" style={{ background: 'var(--success)' }} />
          Succeeded
        </div>
        <div>
          <span className="analytics-legend-dot" style={{ background: 'var(--error)' }} />
          Failed
        </div>
      </div>
    </div>
  );
}

export function TopFlowsList({ stats }: { stats: AnalyticsStats }) {
  return (
    <div className="card analytics-chart-card">
      <div className="analytics-chart-title">Top Flows</div>
      <div className="analytics-flow-list">
        {stats.byFlow.map((flow, i) => (
          <div key={flow.flowId} className="analytics-flow-row">
            <div className="analytics-flow-rank">{i + 1}</div>
            <div className="analytics-flow-info">
              <div className="analytics-flow-name">{flow.flowName}</div>
              <div className="analytics-flow-count">{flow.count} runs</div>
            </div>
            <div className={`analytics-flow-rate ${successRateClass(flow.successRate)}`}>
              {flow.successRate}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
