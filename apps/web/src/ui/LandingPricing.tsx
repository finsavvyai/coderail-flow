import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Get started with basic automation',
    features: ['3 flows', '10 runs/month', 'Screenshot capture', 'Community support'],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    desc: 'For teams that need more power',
    features: [
      '25 flows',
      '500 runs/month',
      'SRT subtitle export',
      'Visual overlays',
      'Priority support',
      'API access',
    ],
    cta: 'Get Early Access',
    featured: true,
  },
  {
    name: 'Team',
    price: '$79',
    period: '/month',
    desc: 'For growing organizations',
    features: [
      'Unlimited flows',
      '2,000 runs/month',
      '5 team seats',
      'Custom branding',
      'Webhook integrations',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="lp-section" id="pricing">
      <div className="lp-section-inner">
        <div className="lp-section-header">
          <h2>Simple, transparent pricing</h2>
          <p>Start free. Scale as you grow.</p>
        </div>
        <div className="lp-pricing-grid">
          {PLANS.map((p, i) => (
            <div key={i} className={`lp-pricing-card ${p.featured ? 'lp-pricing-featured' : ''}`}>
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
              <Link to="/app" className={p.featured ? 'lp-btn-primary' : 'lp-btn-outline'}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="lp-pricing-note">
          <strong>Early-bird special:</strong> First 50 users get Pro at $19/mo for life.
        </p>
      </div>
    </section>
  );
}
