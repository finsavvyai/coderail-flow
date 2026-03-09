import { Monitor, Camera, FileText, Zap, Shield, Users, ChevronRight } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Monitor size={24} />,
      title: 'Real Browser Automation',
      desc: "Puppeteer-powered flows running on Cloudflare's edge. Navigate, click, fill, wait — all automated.",
    },
    {
      icon: <Camera size={24} />,
      title: 'Per-Step Screenshots',
      desc: 'Every step captures a screenshot. Build visual documentation automatically as flows execute.',
    },
    {
      icon: <FileText size={24} />,
      title: 'SRT Subtitle Generation',
      desc: 'Auto-generate narration subtitles from your flow steps. Perfect for video walkthroughs.',
    },
    {
      icon: <Zap size={24} />,
      title: 'Visual Overlays',
      desc: 'Highlight elements and show captions directly in the browser during execution.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Compliance-Ready',
      desc: 'Screenshot evidence, timestamped logs, and artifact storage for audit trails.',
    },
    {
      icon: <Users size={24} />,
      title: 'Team Collaboration',
      desc: 'Share flows across your organization. Projects, screens, and element mappings for your whole team.',
    },
  ];

  return (
    <section className="lp-section" id="features">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <h2>Everything you need to automate visual workflows</h2>
          <p>From browser automation to visual documentation — one platform.</p>
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

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Define Your Flow',
      desc: 'Use our DSL to describe browser steps: navigate, click, fill, highlight, caption.',
    },
    {
      num: '02',
      title: 'Execute & Capture',
      desc: 'Run flows against any web app. Each step captures screenshots and generates overlays.',
    },
    {
      num: '03',
      title: 'Review & Share',
      desc: 'Browse the screenshot gallery, download artifacts, and share visual documentation.',
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
              {i < steps.length - 1 && <ChevronRight size={20} className="lp-step-arrow" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
