/**
 * Flow Export Utilities
 *
 * Export flows in various formats for documentation, sharing, and archiving.
 */

import { exportAsMarkdown, exportAsHtml, exportAsYaml } from './export-formats';

// Re-export step formatting helpers
export { getStepTitle, getStepDetails, getStepDetailsHtml } from './export-formats';

export type ExportFormat = 'json' | 'markdown' | 'html' | 'yaml';

/** Export flow to specified format */
export function exportFlow(flow: any, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(flow, null, 2);
    case 'markdown':
      return exportAsMarkdown(flow);
    case 'html':
      return exportAsHtml(flow);
    case 'yaml':
      return exportAsYaml(flow);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/** Download exported flow (browser-only) */
export function downloadExportedFlow(content: string, filename: string, format: ExportFormat) {
  const mimeTypes: Record<ExportFormat, string> = {
    json: 'application/json',
    markdown: 'text/markdown',
    html: 'text/html',
    yaml: 'text/yaml',
  };
  const extension: Record<ExportFormat, string> = {
    json: 'json',
    markdown: 'md',
    html: 'html',
    yaml: 'yml',
  };

  const blob = new Blob([content], { type: mimeTypes[format] });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension[format]}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
