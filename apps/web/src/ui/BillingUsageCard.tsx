interface BillingUsageCardProps {
  runsThisMonth: number;
  runsLimit: number;
  plan: string;
}

export function BillingUsageCard({ runsThisMonth, runsLimit, plan }: BillingUsageCardProps) {
  const isOver = runsLimit > 0 && runsThisMonth >= runsLimit;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="h2">Usage This Month</div>
      <div className="usage-stats">
        <div>
          <div className="usage-big-number">
            {runsThisMonth}
            <span className="usage-big-limit"> / {runsLimit === -1 ? 'Unlimited' : runsLimit}</span>
          </div>
          <div className="small">Runs used</div>
        </div>
        <div>
          <div className="usage-big-number">{plan.toUpperCase()}</div>
          <div className="small">Current plan</div>
        </div>
      </div>
      {runsLimit > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="usage-bar-track">
            <div
              className={`usage-bar-fill${isOver ? ' usage-bar-fill--over' : ''}`}
              style={{
                width: `${Math.min(100, (runsThisMonth / runsLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
