import { Pricing } from './LandingPricing';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

export function PricingRedirect() {
  return (
    <div className="landing">
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo" style={{ textDecoration: 'none' }}>
            <Zap size={20} strokeWidth={2.5} />
            <span>CodeRail Flow</span>
          </Link>
          <div className="lp-nav-links">
            <Link to="/" className="lp-btn-sm">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </nav>
      <Pricing />
    </div>
  );
}
