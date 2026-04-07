import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Stats } from './DashboardPage.types';
import { chartTheme, chartTooltipStyle, axisTick } from './chart-theme';

interface DashboardChartsProps {
  stats: Stats;
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const pieData = [
    { name: 'Succeeded', value: stats.succeeded_runs, color: chartTheme.success },
    { name: 'Failed', value: stats.failed_runs, color: chartTheme.error },
  ];

  return (
    <>
      <div className="dash-charts-row">
        <div className="dash-chart-card">
          <h2 className="dash-chart-title">Success Rate</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: { name?: string; percent?: number }) =>
                  `${props.name}: ${((props.percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill={chartTheme.purple}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {stats.runs_over_time && stats.runs_over_time.length > 0 && (
          <div className="dash-chart-card">
            <h2 className="dash-chart-title">Runs Over Time</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.runs_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.border} />
                <XAxis dataKey="date" stroke={chartTheme.textDim} tick={axisTick} />
                <YAxis stroke={chartTheme.textDim} tick={axisTick} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ color: chartTheme.textMuted }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={chartTheme.accent}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {stats.runs_by_flow && stats.runs_by_flow.length > 0 && (
        <div className="dash-chart-card">
          <h2 className="dash-chart-title">Most Popular Flows</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.runs_by_flow.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.border} />
              <XAxis dataKey="flow_name" stroke={chartTheme.textDim} tick={axisTick} />
              <YAxis stroke={chartTheme.textDim} tick={axisTick} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ color: chartTheme.textMuted }} />
              <Bar dataKey="count" fill={chartTheme.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
