import { Link, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function DashboardNav() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || (path === '/app' && location.pathname === '/app/dashboard');

  const links = [
    { to: '/app', label: 'Dashboard' },
    { to: '/app/flows', label: 'Flows' },
    { to: '/projects', label: 'Projects' },
    { to: '/billing', label: 'Billing' },
  ];

  return (
    <nav className="dash-nav">
      <div className="dash-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/app" className="dash-nav-brand">
            <Zap size={18} strokeWidth={2.5} />
            <span>CodeRail Flow</span>
          </Link>
          <div className="dash-nav-links">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`dash-nav-link${isActive(l.to) ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="dash-nav-right">
          <a
            href="https://docs.coderail.app"
            target="_blank"
            rel="noopener noreferrer"
            className="dash-nav-doc"
          >
            Docs
          </a>
        </div>
      </div>
    </nav>
  );
}
