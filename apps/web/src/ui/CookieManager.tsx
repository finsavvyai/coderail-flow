import { Cookie, Plus, X } from 'lucide-react';
import { useCookieProfiles } from './useCookieProfiles';
import { CookieProfileList } from './CookieProfileList';
import { ProfileEditor } from './ProfileEditor';

export function CookieManager({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const cm = useCookieProfiles(projectId);

  return (
    <div className="inspector-layout">
      {/* Left: Profiles List */}
      <div className="cookie-sidebar">
        <div className="card">
          <div className="panel-header">
            <div className="h2">
              <Cookie size={18} style={{ marginRight: 8 }} />
              Auth Profiles
            </div>
            <button
              className="btn btn-icon"
              onClick={onClose}
              aria-label="Close auth profiles"
            >
              <X size={16} />
            </button>
          </div>

          <div className="field-group">
            <input
              className="input mb-8"
              placeholder="New profile name"
              value={cm.newProfileName}
              onChange={(e) => cm.setNewProfileName(e.target.value)}
            />
            <button
              className="btn w-full"
              onClick={cm.createProfile}
              disabled={cm.saving}
              aria-label="Create new auth profile"
            >
              <Plus size={16} aria-hidden="true" /> Create Profile
            </button>
          </div>

          {cm.error && (
            <div className="error-banner error-banner--small mb-12">
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
      <div className="card panel-grow">
        {cm.selectedProfile ? (
          <ProfileEditor cm={cm} />
        ) : (
          <div className="cookie-placeholder">
            <div className="cookie-placeholder-inner">
              <Cookie size={64} className="cookie-placeholder-icon" />
              <div>Select or create an auth profile to manage cookies</div>
              <div className="small mt-8">
                Auth profiles store cookies for running flows against authenticated apps
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
