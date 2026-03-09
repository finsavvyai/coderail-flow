import { Cookie, Plus, X } from 'lucide-react';
import { useCookieProfiles } from './useCookieProfiles';
import { CookieProfileList } from './CookieProfileList';
import { ProfileEditor } from './ProfileEditor';

export function CookieManager({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const cm = useCookieProfiles(projectId);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 16 }}>
      {/* Left: Profiles List */}
      <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div className="h2" style={{ margin: 0 }}>
              <Cookie size={18} style={{ marginRight: 8 }} />
              Auth Profiles
            </div>
            <button
              className="btn"
              onClick={onClose}
              style={{ padding: '10px 12px', minHeight: 44, minWidth: 44 }}
              aria-label="Close auth profiles"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <input
              className="input"
              placeholder="New profile name"
              value={cm.newProfileName}
              onChange={(e) => cm.setNewProfileName(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <button
              className="btn"
              onClick={cm.createProfile}
              disabled={cm.saving}
              style={{ width: '100%' }}
              aria-label="Create new auth profile"
            >
              <Plus size={16} aria-hidden="true" /> Create Profile
            </button>
          </div>

          {cm.error && (
            <div
              style={{
                padding: 8,
                background: '#2a1a1a',
                border: '1px solid #f44336',
                borderRadius: 6,
                color: '#fca5a5',
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {cm.error}
            </div>
          )}

          <CookieProfileList
            profiles={cm.profiles}
            selectedId={cm.selectedProfile?.id}
            onSelect={(p) => cm.setSelectedProfile(p)}
            onDelete={(id) => cm.deleteProfile(id)}
          />
        </div>
      </div>

      {/* Right: Profile Editor */}
      <div className="card" style={{ flex: 1, overflow: 'auto' }}>
        {cm.selectedProfile ? (
          <ProfileEditor cm={cm} />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#a8b3cf',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Cookie size={64} style={{ marginBottom: 16, opacity: 0.5 }} />
              <div>Select or create an auth profile to manage cookies</div>
              <div className="small" style={{ marginTop: 8 }}>
                Auth profiles store cookies for running flows against authenticated apps
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
