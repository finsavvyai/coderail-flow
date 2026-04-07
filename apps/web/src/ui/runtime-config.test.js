import { describe, it, expect } from 'vitest';
import { getWebRuntimeConfig } from './runtime-config';
function makeEnv(overrides = {}) {
    return {
        VITE_API_URL: overrides.VITE_API_URL,
        DEV: overrides.DEV ?? false,
        PROD: overrides.PROD ?? false,
    };
}
describe('getWebRuntimeConfig', () => {
    it('allows local development fallback in dev', () => {
        const config = getWebRuntimeConfig(makeEnv({ DEV: true, PROD: false }));
        expect(config.allowDevelopmentFallback).toBe(true);
        expect(config.protectedAppReady).toBe(true);
        expect(config.authReady).toBe(false);
    });
    it('fails protected routes in production when the API URL is missing', () => {
        const config = getWebRuntimeConfig(makeEnv({
            PROD: true,
        }));
        expect(config.authReady).toBe(true);
        expect(config.protectedAppReady).toBe(false);
        expect(config.issues.some((issue) => issue.code === 'api_url_missing')).toBe(true);
    });
    it('fails production when API URL is missing or non-https', () => {
        const config = getWebRuntimeConfig(makeEnv({
            PROD: true,
        }));
        expect(config.apiReady).toBe(false);
        expect(config.protectedAppReady).toBe(false);
        expect(config.issues.some((issue) => issue.code === 'api_url_missing')).toBe(true);
    });
    it('accepts fully configured production builds', () => {
        const config = getWebRuntimeConfig(makeEnv({
            PROD: true,
            VITE_API_URL: 'https://api.example.com',
        }));
        expect(config.apiReady).toBe(true);
        expect(config.authReady).toBe(true);
        expect(config.protectedAppReady).toBe(true);
        expect(config.issues).toHaveLength(0);
    });
});
