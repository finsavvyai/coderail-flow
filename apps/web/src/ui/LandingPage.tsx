import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Play, Star } from 'lucide-react';
import { Features, HowItWorks } from './LandingFeatures';
import { Pricing } from './LandingPricing';
import { Waitlist } from './LandingWaitlist';

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
            Dashboard <ArrowRight size={16} />
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
        <Star size={16} /> Now in Early Access
      </div>
      <h1 className="lp-hero-title">
        Automate browser workflows.
        <br />
        <span className="lp-gradient-text">Explain them visually.</span>
      </h1>
      <p className="lp-hero-sub">
        CodeRail Flow records, replays, and narrates browser workflows with screenshots, visual
        overlays, and SRT subtitles. Built for support teams, QA, onboarding, and compliance.
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
        <span>Cloudflare Workers</span>
        <span>D1 Database</span>
        <span>R2 Storage</span>
        <span>Browser Rendering</span>
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
