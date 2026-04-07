import React from 'react';
import { Zap, CreditCard, Loader2, Folder, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="fullscreen-loader">
      <Loader2 size={32} className="spin fullscreen-loader-icon" />
      <div className="fullscreen-loader-label">{label}</div>
    </div>
  );
}

export function AuthGateCard({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="auth-gate">
      <div className="auth-gate-card">
        <Zap size={32} className="auth-gate-icon" />
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="auth-gate-actions">{actions}</div>
      </div>
    </div>
  );
}

interface TopBarProps {
  user: { name?: string | null; email?: string | null };
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppTopBar({ user, onSignOut, children }: TopBarProps) {
  return (
    <>
      <div className="app-topbar">
        <div className="app-topbar-inner">
          <Link to="/" className="app-topbar-brand">
            <Zap size={18} strokeWidth={2.5} />
            <span>CodeRail Flow</span>
          </Link>
          <div className="topbar-nav">
            <Link to="/app" className="nav-link">
              Dashboard
            </Link>
            <Link to="/projects" className="nav-link">
              <Folder size={14} /> Projects
            </Link>
            <Link to="/billing" className="nav-link">
              <CreditCard size={14} /> Billing
            </Link>
            <div className="user-pill">
              <div className="user-pill-info">
                <span className="user-pill-name">{user.name || user.email || 'Signed in'}</span>
                {user.email ? <span className="user-pill-email">{user.email}</span> : null}
              </div>
              <button className="btn btn-signout" onClick={onSignOut}>
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
