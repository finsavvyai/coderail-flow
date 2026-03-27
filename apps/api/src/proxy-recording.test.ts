import { describe, expect, it } from 'vitest';
import { buildRecordingScript } from './proxy-recording.js';

describe('buildRecordingScript', () => {
  it('posts recorder events to popup openers as well as iframe parents', () => {
    const script = buildRecordingScript('/proxy/abc', 'https://example.com');

    expect(script).toContain('window.opener');
    expect(script).toContain('window.parent&&window.parent!==window');
    expect(script).toContain("sendMessage({type:'CODERAIL_CONNECTED'})");
  });

  it('rewrites dynamic link href values through the proxy', () => {
    const script = buildRecordingScript('/proxy/abc', 'https://example.com');

    expect(script).toContain("overrideUrlProperty(el,'href')");
    expect(script).toContain("overrideUrlProperty(el,'src')");
  });
});
