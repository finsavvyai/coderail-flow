import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import {
  getAnalyticsStats,
  getElementReliability,
  getRuns,
  getStepAnalytics,
  type AnalyticsStats,
  type ElementReliabilityStats,
  type RunRow,
  type StepAnalyticsStats,
} from './api';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { RunsOverTimeChart, TopFlowsList } from './AnalyticsCharts';
import { StepPerformanceCard, ElementReliabilityCard } from './AnalyticsChartItems';
import { buildOpsSnapshot, OpsSnapshotCard, RecentRunsTable } from './AnalyticsDashboardCharts';

interface AnalyticsDashboardProps {
  projectId?: string;
  selectedRunId?: string;
  onSelectRun?: (runId: string) => void | Promise<void>;
}

export function AnalyticsDashboard({
  projectId,
  selectedRunId,
  onSelectRun,
}: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [stepStats, setStepStats] = useState<StepAnalyticsStats | null>(null);
  const [elementStats, setElementStats] = useState<ElementReliabilityStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [copiedSnapshot, setCopiedSnapshot] = useState(false);

  useEffect(() => {
    void loadStats();
  }, [projectId, timeRange]);

  async function loadStats() {
    try {
      setLoading(true);
      const [data, steps, elements, runs] = await Promise.all([
        getAnalyticsStats(timeRange, projectId),
        getStepAnalytics(timeRange, projectId),
        getElementReliability(projectId),
        getRuns(),
      ]);
      setStats(data);
      setStepStats(steps);
      setElementStats(elements);
      setRecentRuns(runs.slice(0, 8));
    } catch (e) {
      console.error('Failed to load analytics:', e);
      setStats(null);
      setStepStats(null);
      setElementStats(null);
      setRecentRuns([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <Activity size={32} className="spin" style={{ marginBottom: 16 }} />
        <div>Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ marginBottom: 8 }}>Could not load analytics right now.</div>
        <button className="btn" onClick={loadStats}>
          Retry
        </button>
      </div>
    );
  }

  const snapshot = buildOpsSnapshot(stats, recentRuns, timeRange);

  async function handleCopySnapshot() {
    try {
      await navigator.clipboard.writeText(snapshot.message);
      setCopiedSnapshot(true);
      window.setTimeout(() => setCopiedSnapshot(false), 2000);
    } catch (e) {
      console.error('Failed to copy ops snapshot:', e);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            className="btn"
            style={{
              background: timeRange === range ? '#3b82f6' : '#2a2a2a',
              padding: '6px 12px',
              fontSize: 12,
            }}
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      <OpsSnapshotCard
        snapshot={snapshot}
        stats={stats}
        timeRange={timeRange}
        copiedSnapshot={copiedSnapshot}
        onCopySnapshot={handleCopySnapshot}
      />

      <AnalyticsSummaryCards stats={stats} />
      <RunsOverTimeChart stats={stats} />
      <TopFlowsList stats={stats} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        <StepPerformanceCard stepStats={stepStats} />
        <ElementReliabilityCard elementStats={elementStats} />
      </div>

      <RecentRunsTable
        recentRuns={recentRuns}
        selectedRunId={selectedRunId}
        onSelectRun={onSelectRun}
      />
    </div>
  );
}
