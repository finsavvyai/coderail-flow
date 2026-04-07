/**
 * Design-system color tokens for Recharts SVG rendering.
 * SVG attributes cannot resolve CSS custom properties, so we
 * mirror the design-system values here as plain strings.
 *
 * Keep in sync with the CSS variables on .dash-page / .landing.
 */
export const chartTheme = {
    accent: '#2b7cff',
    accentHover: '#1a6aee',
    bg: '#0b0f19',
    bgCard: '#121a2b',
    bgDark: '#080c15',
    border: '#1f2a44',
    text: '#e6e9f2',
    textMuted: '#8b95b0',
    textDim: '#5a6580',
    success: '#4caf50',
    error: '#ef4444',
    purple: '#7c3aed',
    warning: '#f59e0b',
};
/** Shared Recharts tooltip content style. */
export const chartTooltipStyle = {
    backgroundColor: chartTheme.bgCard,
    border: `1px solid ${chartTheme.border}`,
    borderRadius: 8,
    color: chartTheme.text,
};
/** Standard axis tick style. */
export const axisTick = {
    fill: chartTheme.textMuted,
    fontSize: 12,
};
