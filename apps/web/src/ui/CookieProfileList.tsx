import { Trash2 } from 'lucide-react';
import type { AuthProfile } from './cookieManagerTypes';

interface ProfileListProps {
  profiles: AuthProfile[];
  selectedId: string | undefined;
  onSelect: (p: AuthProfile) => void;
  onDelete: (id: string) => void;
}

export function CookieProfileList({ profiles, selectedId, onSelect, onDelete }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="small" style={{ color: '#a8b3cf', textAlign: 'center', padding: 20 }}>
        No auth profiles yet. Create one to store cookies for authenticated flows.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {profiles.map((p) => (
        <div
          key={p.id}
          onClick={() => onSelect(p)}
          style={{
            padding: 10,
            background: selectedId === p.id ? 'rgba(99,102,241,0.15)' : '#1a1a1a',
            border: `1px solid ${selectedId === p.id ? '#6366f1' : '#2a2a2a'}`,
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div className="small" style={{ color: '#a8b3cf' }}>
              {p.cookies.length} cookies
            </div>
          </div>
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(p.id);
            }}
            style={{ padding: '4px 8px', background: '#2a1a1a' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
