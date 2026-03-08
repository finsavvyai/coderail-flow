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
      <div className="h2" style={{ marginBottom: 16 }}>
        Choose Your Plan
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {plans.map((p) => (
          <div
            key={p.key}
            className="card"
            style={{
              border: p.featured ? '1px solid #2b7cff' : undefined,
              position: 'relative',
            }}
          >
            {p.featured && (
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#2b7cff',
                  color: '#fff',
                  padding: '2px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Most Popular
              </div>
            )}
            <div className="h2" style={{ marginBottom: 4 }}>
              {p.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 800 }}>{p.price}</span>
              <span className="small">{p.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
              {p.features.map((f, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 0',
                    fontSize: 13,
                    color: '#a8b3cf',
                  }}
                >
                  <Check size={13} style={{ color: '#4CAF50' }} /> {f}
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
        ))}
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
      <button className="btn" disabled style={{ width: '100%' }}>
        Current Plan
      </button>
    );
  }
  if (planKey === 'free') {
    return (
      <button className="btn" disabled style={{ width: '100%' }}>
        {accountPlan !== 'free' ? 'Downgrade' : 'Active'}
      </button>
    );
  }
  return (
    <button
      className="btn"
      style={{ width: '100%', background: featured ? '#2b7cff' : undefined }}
      onClick={() => onUpgrade(planKey as 'pro' | 'team')}
      disabled={!!upgrading}
    >
      {upgrading === planKey ? 'Redirecting...' : `Upgrade to ${name}`}
    </button>
  );
}
