import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Monitor,
  Camera,
  FileText,
  Shield,
  Users,
  ArrowRight,
  Check,
  Play,
  Star,
  ChevronRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function LandingPage() {
  return (
    <div className="landing">
      <Nav />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <Waitlist />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <div className="lp-logo">
          <Zap size={20} strokeWidth={2.5} />
          <span>CodeRail Flow</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#waitlist">Early Access</a>
          <Link to="/app" className="lp-btn-sm">
            Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-badge">
        <Star size={12} /> Now in Early Access
      </div>
      <h1 className="lp-hero-title">
        Automate browser workflows.
        <br />
        <span className="lp-gradient-text">Explain them visually.</span>
      </h1>
      <p className="lp-hero-sub">
        CodeRail Flow records, replays, and narrates browser workflows with
        screenshots, visual overlays, and SRT subtitles. Built for support
        teams, QA, onboarding, and compliance.
      </p>
      <div className="lp-hero-actions">
        <a href="#waitlist" className="lp-btn-primary">
          Get Early Access <ArrowRight size={16} />
        </a>
        <a href="#how-it-works" className="lp-btn-ghost">
          <Play size={16} /> See How It Works
        </a>
      </div>
      <div className="lp-hero-stats">
        <div className="lp-stat">
          <span className="lp-stat-num">7</span>
          <span className="lp-stat-label">Step Types</span>
        </div>
        <div className="lp-stat-divider" />
        <div className="lp-stat">
          <span className="lp-stat-num">&lt;3s</span>
          <span className="lp-stat-label">Cold Start</span>
        </div>
        <div className="lp-stat-divider" />
        <div className="lp-stat">
          <span className="lp-stat-num">100%</span>
          <span className="lp-stat-label">Serverless</span>
        </div>
      </div>
    </section>
  );
}

function LogoBar() {
  return (
    <section className="lp-logobar">
      <p>Built on</p>
      <div className="lp-logobar-items">
        <span>☁️ Cloudflare Workers</span>
        <span>🗄️ D1 Database</span>
        <span>📦 R2 Storage</span>
        <span>🌐 Browser Rendering</span>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Monitor size={24} />,
      title: "Real Browser Automation",
      desc: "Puppeteer-powered flows running on Cloudflare's edge. Navigate, click, fill, wait — all automated.",
    },
    {
      icon: <Camera size={24} />,
      title: "Per-Step Screenshots",
      desc: "Every step captures a screenshot. Build visual documentation automatically as flows execute.",
    },
    {
      icon: <FileText size={24} />,
      title: "SRT Subtitle Generation",
      desc: "Auto-generate narration subtitles from your flow steps. Perfect for video walkthroughs.",
    },
    {
      icon: <Zap size={24} />,
      title: "Visual Overlays",
      desc: "Highlight elements and show captions directly in the browser during execution.",
    },
    {
      icon: <Shield size={24} />,
      title: "Compliance-Ready",
      desc: "Screenshot evidence, timestamped logs, and artifact storage for audit trails.",
    },
    {
      icon: <Users size={24} />,
      title: "Team Collaboration",
      desc: "Share flows across your organization. Projects, screens, and element mappings for your whole team.",
    },
  ];

  return (
    <section className="lp-section" id="features">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <h2>Everything you need to automate visual workflows</h2>
          <p>
            From browser automation to visual documentation — one platform.
          </p>
        </div>
        <div className="lp-features-grid">
          {features.map((f, i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Define Your Flow",
      desc: "Use our DSL to describe browser steps: navigate, click, fill, highlight, caption.",
    },
    {
      num: "02",
      title: "Execute & Capture",
      desc: "Run flows against any web app. Each step captures screenshots and generates overlays.",
    },
    {
      num: "03",
      title: "Review & Share",
      desc: "Browse the screenshot gallery, download artifacts, and share visual documentation.",
    },
  ];

  return (
    <section className="lp-section lp-section-dark" id="how-it-works">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <h2>How it works</h2>
          <p>Three steps to automated visual documentation.</p>
        </div>
        <div className="lp-steps">
          {steps.map((s, i) => (
            <div key={i} className="lp-step">
              <div className="lp-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && (
                <ChevronRight size={20} className="lp-step-arrow" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Get started with basic automation",
      features: [
        "3 flows",
        "10 runs/month",
        "Screenshot capture",
        "Community support",
      ],
      cta: "Start Free",
      featured: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      desc: "For teams that need more power",
      features: [
        "25 flows",
        "500 runs/month",
        "SRT subtitle export",
        "Visual overlays",
        "Priority support",
        "API access",
      ],
      cta: "Get Early Access",
      featured: true,
    },
    {
      name: "Team",
      price: "$79",
      period: "/month",
      desc: "For growing organizations",
      features: [
        "Unlimited flows",
        "2,000 runs/month",
        "5 team seats",
        "Custom branding",
        "Webhook integrations",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  return (
    <section className="lp-section" id="pricing">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <h2>Simple, transparent pricing</h2>
          <p>Start free. Scale as you grow.</p>
        </div>
        <div className="lp-pricing-grid">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`lp-pricing-card ${p.featured ? "lp-pricing-featured" : ""}`}
            >
              {p.featured && <div className="lp-pricing-badge">Most Popular</div>}
              <h3>{p.name}</h3>
              <div className="lp-pricing-price">
                <span className="lp-pricing-amount">{p.price}</span>
                <span className="lp-pricing-period">{p.period}</span>
              </div>
              <p className="lp-pricing-desc">{p.desc}</p>
              <ul className="lp-pricing-features">
                {p.features.map((f, j) => (
                  <li key={j}>
                    <Check size={14} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/app" className={p.featured ? "lp-btn-primary" : "lp-btn-outline"}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="lp-pricing-note">
          🎉 <strong>Early-bird special:</strong> First 50 users get Pro at $19/mo for life.
        </p>
      </div>
    </section>
  );
}

function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "landing-page" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message === "already_subscribed"
            ? "You're already on the list! We'll be in touch soon."
            : "You're in! We'll notify you when early access opens."
        );
        setEmail("");
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to join. Please try again.");
    }
  }

  return (
    <section className="lp-section lp-section-cta" id="waitlist">
      <div className="lp-section-inner">
        <div className="lp-cta-content">
          <h2>Get early access</h2>
          <p>
            Join the waitlist and be the first to automate your browser
            workflows. Early adopters get exclusive pricing.
          </p>
          {status === "success" ? (
            <div className="lp-cta-success">
              <Check size={20} /> {message}
            </div>
          ) : (
            <form className="lp-cta-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="lp-cta-input"
              />
              <button
                type="submit"
                className="lp-btn-primary"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Joining..." : "Join Waitlist"}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="lp-cta-error">{message}</p>
          )}
          <p className="lp-cta-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <Zap size={16} /> CodeRail Flow
        </div>
        <div className="lp-footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#waitlist">Early Access</a>
          <Link to="/app">Dashboard</Link>
        </div>
        <p className="lp-footer-copy">
          &copy; {new Date().getFullYear()} CodeRail Flow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
