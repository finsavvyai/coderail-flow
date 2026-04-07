function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function parseHttpUrl(value) {
    if (!isNonEmptyString(value))
        return null;
    try {
        const parsed = new URL(value.trim());
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed;
        }
    }
    catch {
        return null;
    }
    return null;
}
export function normalizeExternalBase(value) {
    const parsed = parseHttpUrl(value);
    if (!parsed)
        return '';
    const normalizedPath = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
    return `${parsed.origin}${normalizedPath}`;
}
export function normalizeRecordableUrl(value) {
    const parsed = parseHttpUrl(value);
    return parsed?.toString() ?? null;
}
export function getRecorderRuntimeConfig(env) {
    const issues = [];
    const apiBase = normalizeExternalBase(env.VITE_API_URL);
    const runnerBase = env.DEV
        ? normalizeExternalBase(env.VITE_RUNNER_URL) || 'http://localhost:8788'
        : '';
    const proxyRecorderReady = env.PROD ? apiBase.startsWith('https://') : apiBase.length > 0;
    const localRunnerReady = env.DEV;
    const availableModes = [];
    if (proxyRecorderReady) {
        availableModes.push('iframe', 'window');
    }
    if (localRunnerReady) {
        availableModes.push('server');
    }
    if (!proxyRecorderReady) {
        issues.push(env.PROD
            ? {
                code: 'recorder_proxy_unavailable',
                message: 'Recording requires VITE_API_URL to point at the deployed API so /proxy routes are reachable.',
            }
            : {
                code: 'recorder_proxy_not_configured',
                message: 'Proxy recording is unavailable locally until VITE_API_URL points at the API dev server.',
            });
    }
    return {
        apiBase,
        runnerBase,
        proxyRecorderReady,
        localRunnerReady,
        availableModes,
        defaultMode: availableModes[0] ?? (localRunnerReady ? 'server' : 'iframe'),
        issues,
    };
}
export function getRecorderModeLabel(mode) {
    switch (mode) {
        case 'server':
            return 'Local Browser';
        case 'window':
            return 'New Window';
        case 'iframe':
        default:
            return 'Inline';
    }
}
export function getRecorderModeTitle(mode) {
    switch (mode) {
        case 'server':
            return 'Local Puppeteer browser recording';
        case 'window':
            return 'Popup window recording through the API proxy';
        case 'iframe':
        default:
            return 'Inline recording through the API proxy';
    }
}
export function getNextRecorderMode(currentMode, availableModes) {
    if (availableModes.length === 0)
        return currentMode;
    const currentIndex = availableModes.indexOf(currentMode);
    if (currentIndex === -1)
        return availableModes[0];
    return availableModes[(currentIndex + 1) % availableModes.length];
}
