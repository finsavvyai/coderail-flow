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

interface DashboardChartsProps {
  stats: Stats;
}

const chartTooltipStyle = {
  backgroundColor: '#121a2b',
  border: '1px solid #1f2a44',
  borderRadius: 8,
  color: '#e6e9f2',
};

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const pieData = [
    { name: 'Succeeded', value: stats.succeeded_runs, color: '#4caf50' },
    { name: 'Failed', value: stats.failed_runs, color: '#ef4444' },
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
                fill="#8884d8"
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="date" stroke="#5a6580" tick={{ fill: '#8b95b0', fontSize: 12 }} />
                <YAxis stroke="#5a6580" tick={{ fill: '#8b95b0', fontSize: 12 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ color: '#8b95b0' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2b7cff"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
              <XAxis
                dataKey="flow_name"
                stroke="#5a6580"
                tick={{ fill: '#8b95b0', fontSize: 12 }}
              />
              <YAxis stroke="#5a6580" tick={{ fill: '#8b95b0', fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ color: '#8b95b0' }} />
              <Bar dataKey="count" fill="#2b7cff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
