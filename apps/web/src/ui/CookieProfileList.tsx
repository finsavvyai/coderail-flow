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
      <div className="small profile-empty">
        No auth profiles yet. Create one to store cookies for authenticated flows.
      </div>
    );
  }

  return (
    <div className="profile-list">
      {profiles.map((p) => (
        <div
          key={p.id}
          onClick={() => onSelect(p)}
          className={`profile-item${selectedId === p.id ? ' profile-item--selected' : ''}`}
        >
          <div>
            <div className="profile-name">{p.name}</div>
            <div className="small profile-count">
              {p.cookies.length} cookies
            </div>
          </div>
          <button
            className="btn btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(p.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
