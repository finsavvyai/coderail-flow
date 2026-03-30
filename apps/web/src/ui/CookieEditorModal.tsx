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
      aria-labelledby="cookie-editor-title"
      onClick={onClose}
      className="cookie-modal-backdrop"
    >
      <div
        className="card cookie-modal-body"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cookie-modal-header">
          <div id="cookie-editor-title" className="h2">
            Edit Cookie
          </div>
          <button
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="cookie-modal-fields">
          <div>
            <label htmlFor="cookie-name" className="small field-label">
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
            <label htmlFor="cookie-value" className="small field-label">
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
            <label htmlFor="cookie-domain" className="small field-label">
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
            <label htmlFor="cookie-path" className="small field-label">
              Path
            </label>
            <input
              id="cookie-path"
              className="input"
              value={cookie.path}
              onChange={(e) => onChange({ ...cookie, path: e.target.value })}
            />
          </div>
          <div className="cookie-checkbox-row">
            <label className="cookie-checkbox-label">
              <input
                type="checkbox"
                checked={cookie.secure}
                onChange={(e) => onChange({ ...cookie, secure: e.target.checked })}
              />
              Secure
            </label>
            <label className="cookie-checkbox-label">
              <input
                type="checkbox"
                checked={cookie.httpOnly}
                onChange={(e) => onChange({ ...cookie, httpOnly: e.target.checked })}
              />
              HttpOnly
            </label>
          </div>
          <div>
            <label htmlFor="cookie-samesite" className="small field-label">
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

        <div className="cookie-modal-actions">
          <button className="btn flex-1" onClick={() => onSave(cookie)}>
            <Save size={16} /> Save Cookie
          </button>
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
