import React, { useEffect } from 'react';
import { Save, X } from 'lucide-react';
import type { CookieEntry } from './cookieManagerTypes';

export function CookieEditorModal({
  cookie,
  showValues,
  onSave,
  onClose,
  onChange,
}: {
  cookie: CookieEntry;
  showValues: boolean;
  onSave: (cookie: CookieEntry) => void;
  onClose: () => void;
  onChange: (cookie: CookieEntry) => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit cookie"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="card"
        style={{ width: 500, maxHeight: '80vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="h2" style={{ margin: 0 }}>
            Edit Cookie
          </div>
          <button
            className="btn"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '12px', minHeight: 44, minWidth: 44 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label
              htmlFor="cookie-name"
              className="small"
              style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}
            >
              Name *
            </label>
            <input
              id="cookie-name"
              className="input"
              value={cookie.name}
              onChange={(e) => onChange({ ...cookie, name: e.target.value })}
            />
          </div>
          <div>
            <label
              htmlFor="cookie-value"
              className="small"
              style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}
            >
              Value *
            </label>
            <input
              id="cookie-value"
              className="input"
              type={showValues ? 'text' : 'password'}
              value={cookie.value}
              onChange={(e) => onChange({ ...cookie, value: e.target.value })}
            />
          </div>
          <div>
            <label
              htmlFor="cookie-domain"
              className="small"
              style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}
            >
              Domain *
            </label>
            <input
              id="cookie-domain"
              className="input"
              placeholder=".example.com"
              value={cookie.domain}
              onChange={(e) => onChange({ ...cookie, domain: e.target.value })}
            />
          </div>
          <div>
            <label
              htmlFor="cookie-path"
              className="small"
              style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}
            >
              Path
            </label>
            <input
              id="cookie-path"
              className="input"
              value={cookie.path}
              onChange={(e) => onChange({ ...cookie, path: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={cookie.secure}
                onChange={(e) => onChange({ ...cookie, secure: e.target.checked })}
              />
              Secure
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={cookie.httpOnly}
                onChange={(e) => onChange({ ...cookie, httpOnly: e.target.checked })}
              />
              HttpOnly
            </label>
          </div>
          <div>
            <label
              htmlFor="cookie-samesite"
              className="small"
              style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}
            >
              SameSite
            </label>
            <select
              id="cookie-samesite"
              className="input"
              value={cookie.sameSite}
              onChange={(e) =>
                onChange({ ...cookie, sameSite: e.target.value as CookieEntry['sameSite'] })
              }
            >
              <option value="Strict">Strict</option>
              <option value="Lax">Lax</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={() => onSave(cookie)} style={{ flex: 1 }}>
            <Save size={16} /> Save Cookie
          </button>
          <button className="btn" onClick={onClose} style={{ background: '#1a1a1a' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
