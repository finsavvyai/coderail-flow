import { describe, expect, it } from 'vitest';
import { convertToFlowSteps, getProxyUrl, mergeRecordedActions } from './FlowRecorder.utils';
describe('FlowRecorder utils', () => {
    it('builds proxy URLs with normalized API bases', () => {
        expect(getProxyUrl('https://app.example.com/login?redirect=%2Fhome', 'https://api.example.com')).toBe('https://api.example.com/proxy/aHR0cHM6Ly9hcHAuZXhhbXBsZS5jb20/login?redirect=%2Fhome');
    });
    it('returns null when proxy recording is not configured', () => {
        expect(getProxyUrl('https://app.example.com', '')).toBeNull();
    });
    it('deduplicates recorded actions by id when merging live updates', () => {
        const existing = [
            { id: '1', type: 'goto', timestamp: 1, url: 'https://app.example.com' },
            { id: '2', type: 'click', timestamp: 2, selector: '#login' },
        ];
        const incoming = [
            { id: '2', type: 'click', timestamp: 2, selector: '#login' },
            { id: '3', type: 'fill', timestamp: 3, selector: '#email', value: 'a@b.com' },
        ];
        expect(mergeRecordedActions(existing, incoming).map((action) => action.id)).toEqual([
            '1',
            '2',
            '3',
        ]);
    });
    it('converts recorded actions into flow steps', () => {
        const steps = convertToFlowSteps([
            { id: '1', type: 'goto', timestamp: 1, url: 'https://app.example.com' },
            { id: '2', type: 'click', timestamp: 2, selector: '#login', subtitle: 'Open login' },
        ]);
        expect(steps).toEqual([
            { type: 'goto', url: 'https://app.example.com' },
            {
                type: 'click',
                elementId: 'el--login',
                _selector: '#login',
                narrate: 'Open login',
            },
        ]);
    });
});
