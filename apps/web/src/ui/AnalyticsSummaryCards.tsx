import React from 'react';
import { BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AnalyticsStats } from './api';
import './analytics-ext.css';

export function AnalyticsSummaryCards({ stats }: { stats: AnalyticsStats }) {
  const successRate = stats.total > 0 ? Math.round((stats.succeeded / stats.total) * 100) : 0;

  return (
    <div className="analytics-summary-grid">
      <div className="card analytics-summary-cell">
        <BarChart3 size={24} className="analytics-summary-icon analytics-summary-icon--accent" />
        <div className="analytics-summary-value">{stats.total}</div>
        <div className="analytics-summary-label">Total Runs</div>
      </div>
      <div className="card analytics-summary-cell">
        <CheckCircle size={24} className="analytics-summary-icon analytics-summary-icon--success" />
        <div className="analytics-summary-value analytics-summary-value--success">
          {successRate}%
        </div>
        <div className="analytics-summary-label">Success Rate</div>
      </div>
      <div className="card analytics-summary-cell">
        <XCircle size={24} className="analytics-summary-icon analytics-summary-icon--error" />
        <div className="analytics-summary-value analytics-summary-value--error">{stats.failed}</div>
        <div className="analytics-summary-label">Failed Runs</div>
      </div>
      <div className="card analytics-summary-cell">
        <Clock size={24} className="analytics-summary-icon analytics-summary-icon--warning" />
        <div className="analytics-summary-value">{(stats.avgDuration / 1000).toFixed(1)}s</div>
        <div className="analytics-summary-label">Avg Duration</div>
      </div>
    </div>
  );
}
