import { Trash2, Eye, EyeOff, Download, Plus, Upload } from 'lucide-react';
import type { useCookieProfiles } from './useCookieProfiles';
import { CookieEditorModal } from './CookieEditorModal';

export type CookieManagerState = ReturnType<typeof useCookieProfiles>;

export function ProfileEditor({ cm }: { cm: CookieManagerState }) {
  const profile = cm.selectedProfile!;

  return (
    <>
      <ProfileToolbar cm={cm} profileName={profile.name} />
      <CookiesTable cm={cm} />
      <ImportSection cm={cm} />
      {cm.editingCookie && (
        <CookieEditorModal
          cookie={cm.editingCookie}
          showValues={cm.showValues}
          onSave={cm.saveCookie}
          onClose={() => cm.setEditingCookie(null)}
          onChange={cm.setEditingCookie}
        />
      )}
    </>
  );
}

function ProfileToolbar({ cm, profileName }: { cm: CookieManagerState; profileName: string }) {
  return (
    <div className="profile-toolbar">
      <h2>{profileName}</h2>
      <div className="profile-toolbar-actions">
        <button
          className="btn btn-dark"
          onClick={() => cm.setShowValues(!cm.showValues)}
        >
          {cm.showValues ? <EyeOff size={16} /> : <Eye size={16} />}
          {cm.showValues ? 'Hide' : 'Show'} Values
        </button>
        <button className="btn btn-dark" onClick={cm.exportProfile}>
          <Download size={16} /> Export
        </button>
        <button className="btn" onClick={cm.addCookie}>
          <Plus size={16} /> Add Cookie
        </button>
      </div>
    </div>
  );
}

function CookiesTable({ cm }: { cm: CookieManagerState }) {
  const profile = cm.selectedProfile!;
  return (
    <div className="cookies-section">
      <h2>Cookies ({profile.cookies.length})</h2>
      {profile.cookies.length === 0 ? (
        <div className="cookies-empty">
          No cookies. Add cookies manually or import from a JSON file.
        </div>
      ) : (
        <table className="table cookies-table">
          <caption className="sr-only">Cookies in this profile</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Domain</th>
              <th scope="col">Value</th>
              <th scope="col">Secure</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profile.cookies.map((cookie, i) => (
              <tr key={i}>
                <td className="mono">
                  {cookie.name}
                </td>
                <td className="small">{cookie.domain}</td>
                <td className="mono cookie-value">
                  {cm.showValues
                    ? cookie.value
                    : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                </td>
                <td>{cookie.secure ? '\u2713' : '\u2717'}</td>
                <td>
                  <div className="cookie-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => cm.setEditingCookie(cookie)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => cm.deleteCookie(cookie)}
                      aria-label="Delete cookie"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ImportSection({ cm }: { cm: CookieManagerState }) {
  return (
    <div className="import-section">
      <h2>
        <Upload size={14} style={{ marginRight: 6 }} />
        Import Cookies
      </h2>
      <textarea
        className="input import-textarea"
        placeholder='Paste JSON: {"cookies": [{"name": "session", "value": "...", "domain": ".example.com"}]}'
        value={cm.importJson}
        onChange={(e) => cm.setImportJson(e.target.value)}
        rows={4}
      />
      <button className="btn" onClick={cm.importProfile} disabled={!cm.importJson.trim()}>
        <Upload size={16} /> Import
      </button>
    </div>
  );
}
