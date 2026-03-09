import React from 'react';

interface BillingUsageCardProps {
  runsThisMonth: number;
  runsLimit: number;
  plan: string;
}

export function BillingUsageCard({ runsThisMonth, runsLimit, plan }: BillingUsageCardProps) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="h2">Usage This Month</div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#e6e9f2' }}>
            {runsThisMonth}
            <span style={{ fontSize: 14, fontWeight: 400, color: '#8b95b0' }}>
              {' '}
              / {runsLimit === -1 ? 'Unlimited' : runsLimit}
            </span>
          </div>
          <div className="small">Runs used</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#e6e9f2' }}>
            {plan.toUpperCase()}
          </div>
          <div className="small">Current plan</div>
        </div>
      </div>
      {runsLimit > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ width: '100%', height: 6, backgroundColor: '#1f2a44', borderRadius: 3 }}>
            <div
              style={{
                width: `${Math.min(100, (runsThisMonth / runsLimit) * 100)}%`,
                height: '100%',
                backgroundColor: runsThisMonth >= runsLimit ? '#f44336' : '#2b7cff',
                borderRadius: 3,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
