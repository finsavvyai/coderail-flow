import { useState, useEffect } from 'react';
import { DashboardStatCards } from './DashboardStatCards';
import { DashboardCharts } from './DashboardCharts';
import { DashboardRunsTable } from './DashboardRunsTable';
import { DashboardEmptyState } from './DashboardEmptyState';
import { DashboardSkeleton } from './DashboardSkeleton';
import { authHeaders } from './api-core';
import toast from 'react-hot-toast';
import type { Run, Stats } from './DashboardPage.types';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadStats();
    void loadRuns();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/stats?dateRange=${dateRange}`, {
        headers: await authHeaders(),
      });
      if (response.ok) {
        setStats(await response.json());
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load stats');
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async () => {
    try {
      const response = await fetch(`/api/runs?limit=10&sort=created_at&order=desc`, {
        headers: await authHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setRuns(data.runs || data);
      }
    } catch (error) {
      console.error('Failed to load runs:', error);
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-content">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dash-page">
        <div className="dash-content">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Dashboard</h1>
              <p className="dash-subtitle">Overview of your flow executions</p>
            </div>
          </div>
          <DashboardEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-content">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Overview of your flow executions</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="dash-select"
            aria-label="Date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        <div className="dash-gap">
          <DashboardStatCards stats={stats} />
          <DashboardCharts stats={stats} />
          <DashboardRunsTable runs={runs} />
          {stats.total_runs === 0 && <DashboardEmptyState />}
        </div>
      </div>
    </div>
  );
}
