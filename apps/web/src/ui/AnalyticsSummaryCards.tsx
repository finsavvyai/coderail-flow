import React from 'react';
import { BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AnalyticsStats } from './api';

export function AnalyticsSummaryCards({ stats }: { stats: AnalyticsStats }) {
  const successRate = stats.total > 0 ? Math.round((stats.succeeded / stats.total) * 100) : 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div className="card" style={{ textAlign: 'center' }}>
        <BarChart3 size={24} style={{ color: '#3b82f6', marginBottom: 8 }} />
        <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.total}</div>
        <div style={{ fontSize: 12, color: '#a3a3a3' }}>Total Runs</div>
      </div>
      <div className="card" style={{ textAlign: 'center' }}>
        <CheckCircle size={24} style={{ color: '#22c55e', marginBottom: 8 }} />
        <div style={{ fontSize: 28, fontWeight: 600, color: '#22c55e' }}>{successRate}%</div>
        <div style={{ fontSize: 12, color: '#a3a3a3' }}>Success Rate</div>
      </div>
      <div className="card" style={{ textAlign: 'center' }}>
        <XCircle size={24} style={{ color: '#ef4444', marginBottom: 8 }} />
        <div style={{ fontSize: 28, fontWeight: 600, color: '#ef4444' }}>{stats.failed}</div>
        <div style={{ fontSize: 12, color: '#a3a3a3' }}>Failed Runs</div>
      </div>
      <div className="card" style={{ textAlign: 'center' }}>
        <Clock size={24} style={{ color: '#f59e0b', marginBottom: 8 }} />
        <div style={{ fontSize: 28, fontWeight: 600 }}>
          {(stats.avgDuration / 1000).toFixed(1)}s
        </div>
        <div style={{ fontSize: 12, color: '#a3a3a3' }}>Avg Duration</div>
      </div>
    </div>
  );
}
