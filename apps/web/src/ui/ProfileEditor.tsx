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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <h2 style={{ margin: 0 }}>{profileName}</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn"
          onClick={() => cm.setShowValues(!cm.showValues)}
          style={{ background: '#1a1a1a' }}
        >
          {cm.showValues ? <EyeOff size={16} /> : <Eye size={16} />}
          {cm.showValues ? 'Hide' : 'Show'} Values
        </button>
        <button className="btn" onClick={cm.exportProfile} style={{ background: '#1a1a1a' }}>
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
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 14, marginBottom: 8 }}>Cookies ({profile.cookies.length})</h2>
      {profile.cookies.length === 0 ? (
        <div
          style={{
            padding: 20,
            background: '#1a1a1a',
            borderRadius: 8,
            textAlign: 'center',
            color: '#a8b3cf',
          }}
        >
          No cookies. Add cookies manually or import from a JSON file.
        </div>
      ) : (
        <table className="table" style={{ width: '100%' }}>
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
                <td className="mono" style={{ fontSize: 12 }}>
                  {cookie.name}
                </td>
                <td className="small">{cookie.domain}</td>
                <td
                  className="mono"
                  style={{
                    fontSize: 11,
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cm.showValues
                    ? cookie.value
                    : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                </td>
                <td>{cookie.secure ? '\u2713' : '\u2717'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn"
                      onClick={() => cm.setEditingCookie(cookie)}
                      style={{ padding: '8px 12px', minHeight: 44 }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn"
                      onClick={() => cm.deleteCookie(cookie)}
                      aria-label="Delete cookie"
                      style={{
                        padding: '8px 12px',
                        minHeight: 44,
                        minWidth: 44,
                        background: '#2a1a1a',
                      }}
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
    <div
      style={{
        padding: 16,
        background: '#1a1a1a',
        borderRadius: 8,
        border: '1px solid #2a2a2a',
      }}
    >
      <h2 style={{ fontSize: 14, marginBottom: 8 }}>
        <Upload size={14} style={{ marginRight: 6 }} />
        Import Cookies
      </h2>
      <textarea
        className="input"
        placeholder='Paste JSON: {"cookies": [{"name": "session", "value": "...", "domain": ".example.com"}]}'
        value={cm.importJson}
        onChange={(e) => cm.setImportJson(e.target.value)}
        rows={4}
        style={{ marginBottom: 8, fontFamily: 'monospace', fontSize: 11 }}
      />
      <button className="btn" onClick={cm.importProfile} disabled={!cm.importJson.trim()}>
        <Upload size={16} /> Import
      </button>
    </div>
  );
}
