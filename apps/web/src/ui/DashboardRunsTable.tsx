import { useNavigate } from 'react-router-dom';
import type { Run } from './DashboardPage.types';

interface DashboardRunsTableProps {
  runs: Run[];
}

export function DashboardRunsTable({ runs }: DashboardRunsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="dash-table-card">
      <div className="dash-table-header">
        <h2>Recent Runs</h2>
      </div>
      {runs.length > 0 ? (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Flow</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td className="flow-name">{run.flow_name}</td>
                <td>
                  <span className={`dash-badge ${run.status}`}>{run.status}</span>
                </td>
                <td>{((run.duration || 0) / 1000).toFixed(1)}s</td>
                <td className="muted">{new Date(run.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => navigate(`/app/runs/${run.id}`)}
                    className="dash-table-link"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="dash-table-empty">
          <p>No runs yet</p>
          <button onClick={() => navigate('/app/flows')} className="dash-empty-btn">
            Create Your First Flow
          </button>
        </div>
      )}
    </div>
  );
}
