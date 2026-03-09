interface ImportInstructionsProps {
  className?: string;
}

export function ImportInstructions({ className }: ImportInstructionsProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className || ''}`}>
      <h3 className="text-sm font-semibold text-blue-900 mb-2">
        How to export cookies:
      </h3>
      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
        <li>Install "EditThisCookie" extension (Chrome/Firefox)</li>
        <li>Visit the website you want to authenticate</li>
        <li>Click the extension icon &rarr; Export &rarr; JSON</li>
        <li>Upload the JSON file below</li>
      </ol>
    </div>
  );
}

interface ImportErrorDisplayProps {
  error: string;
}

export function ImportErrorDisplay({ error }: ImportErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-red-600 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
}

export function SecurityNotice() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-yellow-600 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-900">
            Security Notice
          </h3>
          <p className="text-sm text-yellow-800 mt-1">
            Cookies will be encrypted with AES-256-GCM before storage.
            Never share authentication cookies with unauthorized users.
          </p>
        </div>
      </div>
    </div>
  );
}
