import { Skeleton } from './Modal';

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <div style={{ marginTop: 12 }}>
              <Skeleton width={60} height={12} />
            </div>
            <div style={{ marginTop: 8 }}>
              <Skeleton width={80} height={24} />
            </div>
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="card" style={{ padding: 20 }}>
        <Skeleton width={120} height={16} />
        <div style={{ marginTop: 16 }}>
          <Skeleton width="100%" height={200} borderRadius={8} />
        </div>
      </div>
      {/* Table rows */}
      <div className="card" style={{ padding: 16 }}>
        <Skeleton width={100} height={16} />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Skeleton width={60} height={12} />
              <Skeleton width="40%" height={12} />
              <Skeleton width={80} height={24} borderRadius={12} />
              <Skeleton width={100} height={12} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
