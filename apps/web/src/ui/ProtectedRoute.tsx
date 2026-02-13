import React, { useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { Zap, ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { setTokenProvider } from "./api";

function TokenSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);
  return null;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <TokenSync />
        <div className="app-topbar">
          <div className="app-topbar-inner">
            <Link to="/" className="app-topbar-brand">
              <Zap size={18} strokeWidth={2.5} />
              <span>CodeRail Flow</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link to="/app" style={{ fontSize: 13, color: "#8b95b0", textDecoration: "none" }}>Dashboard</Link>
              <Link to="/billing" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#8b95b0", textDecoration: "none" }}>
                <CreditCard size={14} /> Billing
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="auth-gate">
          <div className="auth-gate-card">
            <Zap size={32} className="auth-gate-icon" />
            <h2>Sign in to CodeRail Flow</h2>
            <p>Access your browser automation dashboard.</p>
            <SignInButton mode="modal">
              <button className="lp-btn-primary">Sign In</button>
            </SignInButton>
            <Link to="/" className="auth-gate-back">
              <ArrowLeft size={14} /> Back to home
            </Link>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
