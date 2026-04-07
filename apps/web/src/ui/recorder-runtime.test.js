import { describe, expect, it } from 'vitest';
import { getNextRecorderMode, getRecorderRuntimeConfig, normalizeExternalBase, normalizeRecordableUrl, } from './recorder-runtime';
function makeEnv(overrides = {}) {
    return {
        VITE_API_URL: overrides.VITE_API_URL,
        VITE_RUNNER_URL: overrides.VITE_RUNNER_URL,
        DEV: overrides.DEV ?? false,
        PROD: overrides.PROD ?? false,
    };
}
describe('getRecorderRuntimeConfig', () => {
    it('defaults local development to the dev runner when no API origin is configured', () => {
        const config = getRecorderRuntimeConfig(makeEnv({ DEV: true }));
        expect(config.localRunnerReady).toBe(true);
        expect(config.proxyRecorderReady).toBe(false);
        expect(config.availableModes).toEqual(['server']);
        expect(config.defaultMode).toBe('server');
        expect(config.runnerBase).toBe('http://localhost:8788');
    });
    it('prefers proxy-backed recording in production', () => {
        const config = getRecorderRuntimeConfig(makeEnv({
            PROD: true,
            VITE_API_URL: 'https://api.example.com/',
        }));
        expect(config.proxyRecorderReady).toBe(true);
        expect(config.localRunnerReady).toBe(false);
        expect(config.availableModes).toEqual(['iframe', 'window']);
        expect(config.defaultMode).toBe('iframe');
        expect(config.apiBase).toBe('https://api.example.com');
    });
    it('supports both proxy and local-runner modes in local development when API is configured', () => {
        const config = getRecorderRuntimeConfig(makeEnv({
            DEV: true,
            VITE_API_URL: 'http://localhost:8787',
            VITE_RUNNER_URL: 'http://localhost:8788/',
        }));
        expect(config.availableModes).toEqual(['iframe', 'window', 'server']);
        expect(config.defaultMode).toBe('iframe');
        expect(config.runnerBase).toBe('http://localhost:8788');
    });
});
describe('recorder runtime helpers', () => {
    it('normalizes external bases and target URLs', () => {
        expect(normalizeExternalBase('https://api.example.com/')).toBe('https://api.example.com');
        expect(normalizeExternalBase('https://api.example.com/base/')).toBe('https://api.example.com/base');
        expect(normalizeRecordableUrl('https://app.example.com/login')).toBe('https://app.example.com/login');
        expect(normalizeRecordableUrl('not-a-url')).toBeNull();
    });
    it('cycles through only the configured recorder modes', () => {
        expect(getNextRecorderMode('iframe', ['iframe', 'window', 'server'])).toBe('window');
        expect(getNextRecorderMode('window', ['iframe', 'window'])).toBe('iframe');
        expect(getNextRecorderMode('server', ['server'])).toBe('server');
    });
});
