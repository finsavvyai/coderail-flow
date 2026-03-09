import { useState, useRef } from 'react';
import { toastUtils } from './toast';
import { Button } from './Button';
import type { ImportCookie, CookieImportModalProps } from './CookieImportTypes';
import { validateCookieArray } from './CookieImportTypes';
import { CookieImportPreview } from './CookieImportPreview';
import { ImportInstructions, ImportErrorDisplay, SecurityNotice } from './CookieImportNotices';

export type { CookieImportModalProps, ImportCookie as Cookie };

export function CookieImportModal({
  projectId: _projectId,
  onSave,
  onCancel,
}: CookieImportModalProps) {
  const [profileName, setProfileName] = useState('');
  const [cookies, setCookies] = useState<ImportCookie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validated = validateCookieArray(json);
        setCookies(validated);
        toastUtils.success(`Loaded ${validated.length} cookies`);
      } catch (err: any) {
        setError(err.message || 'Failed to parse cookies');
        toastUtils.error('Invalid cookie file format');
      }
    };

    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!profileName.trim()) {
      setError('Please enter a profile name');
      return;
    }
    if (cookies.length === 0) {
      setError('Please upload cookies');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({ name: profileName, cookies });
      toastUtils.success('Auth profile saved!');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      toastUtils.error('Failed to save auth profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader onCancel={onCancel} loading={loading} />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <ImportInstructions />

          <ProfileNameInput value={profileName} onChange={setProfileName} disabled={loading} />

          <FileUploadField
            fileInputRef={fileInputRef}
            onUpload={handleFileUpload}
            cookieCount={cookies.length}
            disabled={loading}
          />

          <CookieImportPreview cookies={cookies} />
          <ImportErrorDisplay error={error} />
          <SecurityNotice />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
            disabled={!profileName || cookies.length === 0}
          >
            Save Auth Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModalHeader(props: { onCancel: () => void; loading: boolean }) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Import Authentication Cookies</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload cookies to enable authenticated workflow execution
        </p>
      </div>
      <button
        onClick={props.onCancel}
        className="text-gray-400 hover:text-gray-600"
        disabled={props.loading}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function ProfileNameInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Name *</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Production Account, Staging User"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        disabled={disabled}
      />
    </div>
  );
}

function FileUploadField({
  fileInputRef,
  onUpload,
  cookieCount,
  disabled,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cookieCount: number;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Cookies JSON File *</label>
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onUpload}
          className="hidden"
          disabled={disabled}
        />
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Choose File
        </Button>
        {cookieCount > 0 && (
          <span className="text-sm text-gray-600">{cookieCount} cookies loaded</span>
        )}
      </div>
    </div>
  );
}
