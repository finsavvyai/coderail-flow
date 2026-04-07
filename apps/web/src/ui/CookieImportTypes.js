export function getCookieExpiryStatus(cookie) {
    if (!cookie.expires)
        return { status: 'session', color: 'text-gray-500' };
    const expiry = new Date(cookie.expires);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) {
        return { status: 'Expired', color: 'text-red-600' };
    }
    else if (daysUntilExpiry < 7) {
        const s = daysUntilExpiry !== 1 ? 's' : '';
        return { status: `Expires in ${daysUntilExpiry} day${s}`, color: 'text-orange-600' };
    }
    else {
        return { status: `Expires in ${daysUntilExpiry} days`, color: 'text-green-600' };
    }
}
export function validateCookieArray(json) {
    if (!Array.isArray(json)) {
        throw new Error('Invalid format: Expected an array of cookies');
    }
    for (const cookie of json) {
        if (!cookie.name || typeof cookie.name !== 'string') {
            throw new Error('Invalid cookie: missing or invalid "name" field');
        }
        if (typeof cookie.value !== 'string') {
            throw new Error('Invalid cookie: missing or invalid "value" field');
        }
    }
    return json;
}
