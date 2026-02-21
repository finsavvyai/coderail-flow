import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Check, Zap, ArrowLeft, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

type AccountInfo = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  runsThisMonth: number;
  runsLimit: number;
  flowsLimit: number;
  hasSubscription: boolean;
};

export function BillingPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    syncAccount();
  }, [isLoaded, user]);

  async function syncAccount() {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/billing/account/sync`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress ?? "",
          name: user.fullName,
        }),
      });
      const data = await res.json();
      setAccount(data.user);
    } catch (err) {
      console.error("Failed to sync account:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(plan: "pro" | "team") {
    if (!user) return;
    setUpgrading(plan);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/billing/checkout`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to create checkout session. Lemon Squeezy may not be configured yet.");
      }
    } catch (err) {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setUpgrading(null);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: 80 }}>
        <Loader2 size={32} className="spin" style={{ color: "#2b7cff" }} />
        <p className="small" style={{ marginTop: 12 }}>Loading billing info...</p>
      </div>
    );
  }

  const plans = [
    {
      key: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["3 flows", "10 runs/month", "Screenshot capture", "Community support"],
      current: account?.plan === "free",
    },
    {
      key: "pro",
      name: "Pro",
      price: "$29",
      period: "/month",
      features: ["25 flows", "500 runs/month", "SRT subtitle export", "Visual overlays", "Priority support", "API access"],
      current: account?.plan === "pro",
      featured: true,
    },
    {
      key: "team",
      name: "Team",
      price: "$79",
      period: "/month",
      features: ["Unlimited flows", "2,000 runs/month", "5 team seats", "Custom branding", "Webhook integrations", "Dedicated support"],
      current: account?.plan === "team",
    },
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: 20 }}>
        <Link to="/app" className="auth-gate-back" style={{ marginBottom: 16, display: "inline-flex" }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Usage Overview */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="h2">Usage This Month</div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#e6e9f2" }}>
              {account?.runsThisMonth ?? 0}
              <span style={{ fontSize: 14, fontWeight: 400, color: "#8b95b0" }}>
                {" "}/{" "}{account?.runsLimit === -1 ? "∞" : account?.runsLimit ?? 10}
              </span>
            </div>
            <div className="small">Runs used</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#e6e9f2" }}>
              {account?.plan?.toUpperCase() ?? "FREE"}
            </div>
            <div className="small">Current plan</div>
          </div>
        </div>
        {/* Progress bar */}
        {account && account.runsLimit > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ width: "100%", height: 6, backgroundColor: "#1f2a44", borderRadius: 3 }}>
              <div
                style={{
                  width: `${Math.min(100, (account.runsThisMonth / account.runsLimit) * 100)}%`,
                  height: "100%",
                  backgroundColor: account.runsThisMonth >= account.runsLimit ? "#f44336" : "#2b7cff",
                  borderRadius: 3,
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="h2" style={{ marginBottom: 16 }}>Choose Your Plan</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        {plans.map((p) => (
          <div
            key={p.key}
            className="card"
            style={{
              border: p.featured ? "1px solid #2b7cff" : undefined,
              position: "relative",
            }}
          >
            {p.featured && (
              <div style={{
                position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                background: "#2b7cff", color: "#fff", padding: "2px 12px", borderRadius: 999,
                fontSize: 11, fontWeight: 700,
              }}>
                Most Popular
              </div>
            )}
            <div className="h2" style={{ marginBottom: 4 }}>{p.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 800 }}>{p.price}</span>
              <span className="small">{p.period}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
              {p.features.map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: 13, color: "#a8b3cf" }}>
                  <Check size={13} style={{ color: "#4CAF50" }} /> {f}
                </li>
              ))}
            </ul>
            {p.current ? (
              <button className="btn" disabled style={{ width: "100%", opacity: 0.6 }}>
                Current Plan
              </button>
            ) : p.key === "free" ? (
              <button className="btn" disabled style={{ width: "100%", opacity: 0.5 }}>
                {account?.plan !== "free" ? "Downgrade" : "Active"}
              </button>
            ) : (
              <button
                className="btn"
                style={{ width: "100%", background: p.featured ? "#2b7cff" : undefined }}
                onClick={() => handleUpgrade(p.key as "pro" | "team")}
                disabled={!!upgrading}
              >
                {upgrading === p.key ? "Redirecting..." : `Upgrade to ${p.name}`}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="small" style={{ textAlign: "center", color: "#5a6580" }}>
        🎉 Early-bird special: First 50 users get Pro at $19/mo for life.
        <br />
        Payments secured by Lemon Squeezy. Cancel anytime.
      </p>
    </div>
  );
}
