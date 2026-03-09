import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { BillingPlanCards } from './BillingPlanCards';
import { BillingUsageCard } from './BillingUsageCard';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress ?? '',
          name: user.fullName,
        }),
      });
      const data = await res.json();
      setAccount(data.user);
    } catch (err) {
      console.error('Failed to sync account:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(plan: 'pro' | 'team') {
    if (!user) return;
    setUpgrading(plan);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/billing/checkout`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(
          data.error ||
            'Failed to create checkout session. Lemon Squeezy may not be configured yet.'
        );
      }
    } catch {
      alert('Failed to start checkout. Please try again.');
    } finally {
      setUpgrading(null);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <Loader2 size={32} className="spin" style={{ color: '#2b7cff' }} />
        <p className="small" style={{ marginTop: 12 }}>
          Loading billing info...
        </p>
      </div>
    );
  }

  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['3 flows', '10 runs/month', 'Screenshot capture', 'Community support'],
      current: account?.plan === 'free',
    },
    {
      key: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: [
        '25 flows',
        '500 runs/month',
        'SRT subtitle export',
        'Visual overlays',
        'Priority support',
        'API access',
      ],
      current: account?.plan === 'pro',
      featured: true,
    },
    {
      key: 'team',
      name: 'Team',
      price: '$79',
      period: '/month',
      features: [
        'Unlimited flows',
        '2,000 runs/month',
        '5 team seats',
        'Custom branding',
        'Webhook integrations',
        'Dedicated support',
      ],
      current: account?.plan === 'team',
    },
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/app"
          className="auth-gate-back"
          style={{ marginBottom: 16, display: 'inline-flex' }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {account && (
        <BillingUsageCard
          runsThisMonth={account.runsThisMonth}
          runsLimit={account.runsLimit}
          plan={account.plan}
        />
      )}

      <BillingPlanCards
        plans={plans}
        accountPlan={account?.plan ?? 'free'}
        upgrading={upgrading}
        onUpgrade={handleUpgrade}
      />

      <p className="small" style={{ textAlign: 'center', color: '#5a6580' }}>
        Early-bird special: First 50 users get Pro at $19/mo for life.
        <br />
        Payments secured by Lemon Squeezy. Cancel anytime.
      </p>
    </div>
  );
}
