import { useNavigate } from 'react-router-dom';

export function DashboardEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="dash-empty">
      <svg
        className="dash-empty-icon"
        width="48"
        height="48"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3>No statistics yet</h3>
      <p>Get started by running your first flow.</p>
      <button onClick={() => void navigate('/app/flows')} className="dash-empty-btn">
        Run Your First Flow
      </button>
    </div>
  );
}
