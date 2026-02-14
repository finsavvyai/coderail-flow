import React, { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { Zap, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { setTokenProvider } from "./api";

function TokenSync({ onReady }: { onReady: () => void }) {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenProvider(() => getToken());
    onReady();
  }, [getToken]);
  return null;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [tokenReady, setTokenReady] = useState(false);

  return (
    <>
      <SignedIn>
        <TokenSync onReady={() => setTokenReady(true)} />
        {!tokenReady ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Loader2 size={32} className="spin" style={{ color: "#6366f1" }} />
          </div>
        ) : null}
        <div className="app-topbar" style={{ display: tokenReady ? undefined : "none" }}>
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
        {tokenReady ? children : null}
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
