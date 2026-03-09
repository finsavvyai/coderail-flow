import type { ImportCookie } from './CookieImportTypes';
import { getCookieExpiryStatus } from './CookieImportTypes';

interface CookieImportPreviewProps {
  cookies: ImportCookie[];
}

export function CookieImportPreview({ cookies }: CookieImportPreviewProps) {
  if (cookies.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Preview (First 10)</h3>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Domain
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Value (masked)
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cookies.slice(0, 10).map((cookie, index) => {
              const status = getCookieExpiryStatus(cookie);
              return (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{cookie.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{cookie.domain || '*'}</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-600">
                    {cookie.value.slice(0, 8)}
                    {cookie.value.length > 8 ? '...' : ''}
                  </td>
                  <td className={`px-4 py-2 text-xs ${status.color}`}>{status.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cookies.length > 10 && (
          <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
            ... and {cookies.length - 10} more cookies
          </div>
        )}
      </div>
    </div>
  );
}
