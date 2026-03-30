import { Check } from 'lucide-react';

interface Plan {
  key: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  current: boolean;
  featured?: boolean;
}

interface BillingPlanCardsProps {
  plans: Plan[];
  accountPlan: string;
  upgrading: string | null;
  onUpgrade: (plan: 'pro' | 'team') => void;
}

export function BillingPlanCards({
  plans,
  accountPlan,
  upgrading,
  onUpgrade,
}: BillingPlanCardsProps) {
  return (
    <>
      <div className="h2 billing-plan-heading">Choose Your Plan</div>
      <div className="billing-plan-grid">
        {plans.map((p) => {
          const cardClass = [
            'billing-plan-card',
            p.featured ? 'featured' : '',
            p.current ? 'current' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={p.key} className={cardClass}>
              {p.featured && (
                <div className="billing-popular-badge">Most Popular</div>
              )}
              <div className="billing-plan-name">{p.name}</div>
              <div className="billing-plan-price-row">
                <span className="billing-plan-price">{p.price}</span>
                <span className="billing-plan-period">{p.period}</span>
              </div>
              <ul className="billing-plan-features">
                {p.features.map((f, i) => (
                  <li key={i}>
                    <Check size={13} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <PlanButton
                planKey={p.key}
                current={p.current}
                featured={p.featured}
                accountPlan={accountPlan}
                upgrading={upgrading}
                name={p.name}
                onUpgrade={onUpgrade}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

function PlanButton({
  planKey,
  current,
  featured,
  accountPlan,
  upgrading,
  name,
  onUpgrade,
}: {
  planKey: string;
  current: boolean;
  featured?: boolean;
  accountPlan: string;
  upgrading: string | null;
  name: string;
  onUpgrade: (plan: 'pro' | 'team') => void;
}) {
  if (current) {
    return (
      <button className="btn billing-plan-btn" disabled>
        Current Plan
      </button>
    );
  }
  if (planKey === 'free') {
    return (
      <button className="btn billing-plan-btn" disabled>
        {accountPlan !== 'free' ? 'Downgrade' : 'Active'}
      </button>
    );
  }
  return (
    <button
      className={`btn billing-plan-btn${featured ? ' billing-plan-btn-featured' : ''}`}
      onClick={() => onUpgrade(planKey as 'pro' | 'team')}
      disabled={!!upgrading}
    >
      {upgrading === planKey ? 'Redirecting...' : `Upgrade to ${name}`}
    </button>
  );
}
