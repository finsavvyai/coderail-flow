import { describe, it, expect } from 'vitest';
import {
  redactText,
  redactValue,
  detectPiiRegions,
  buildMaskOperations,
  DEFAULT_TEXT_RULES,
  type OCRTextBlock,
} from './pii-redaction.js';

describe('redactText – email', () => {
  it('redacts a plain email', () => {
    expect(redactText('Contact user@example.com now')).toBe('Contact [REDACTED_EMAIL] now');
  });

  it('redacts multiple emails in one string', () => {
    const out = redactText('a@b.com and c@d.io');
    expect(out).not.toContain('@');
    expect(out).toContain('[REDACTED_EMAIL]');
  });

  it('leaves non-email text unchanged', () => {
    expect(redactText('no emails here')).toBe('no emails here');
  });
});

describe('redactText – SSN', () => {
  it('redacts SSN in XXX-XX-XXXX format', () => {
    expect(redactText('My SSN is 123-45-6789')).toBe('My SSN is [REDACTED_SSN]');
  });

  it('does not redact partial SSN-like strings', () => {
    const out = redactText('12-34-5678');
    expect(out).not.toContain('[REDACTED_SSN]');
  });
});

describe('redactText – credit card', () => {
  it('redacts 16-digit card number', () => {
    const out = redactText('Card: 4111111111111111');
    expect(out).toContain('[REDACTED_CARD]');
    expect(out).not.toContain('4111');
  });

  it('redacts card with spaces (tested with cc rule only)', () => {
    const ccRule = DEFAULT_TEXT_RULES.find((r) => r.name === 'credit_card')!;
    const out = redactText('4111 1111 1111 1111', [ccRule]);
    expect(out).toContain('[REDACTED_CARD]');
  });
});

describe('redactText – no-op on clean strings', () => {
  it('does not modify plain text', () => {
    const plain = 'Hello World, this is clean text without PII.';
    expect(redactText(plain)).toBe(plain);
  });

  it('applies custom rules only when provided', () => {
    const custom = [{ name: 'test', pattern: /secret/g, replacement: '[HID]' }];
    expect(redactText('the secret value', custom)).toBe('the [HID] value');
  });
});

describe('redactValue', () => {
  it('redacts string values containing emails', () => {
    const result = redactValue('hello@world.com');
    expect(result).toBe('[REDACTED_EMAIL]');
  });

  it('redacts sensitive keys regardless of value', () => {
    const result = redactValue({ token: 'abc123', name: 'Alice' }) as Record<string, any>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.name).toBe('Alice');
  });

  it('redacts nested sensitive keys', () => {
    const result = redactValue({ user: { password: 'hunter2', email: 'u@x.com' } }) as any;
    expect(result.user.password).toBe('[REDACTED]');
    expect(result.user.email).toBe('[REDACTED_EMAIL]');
  });

  it('handles arrays by redacting each entry', () => {
    const result = redactValue(['user@a.com', 'clean']) as string[];
    expect(result[0]).toBe('[REDACTED_EMAIL]');
    expect(result[1]).toBe('clean');
  });

  it('passes through null and numbers unchanged', () => {
    expect(redactValue(null)).toBe(null);
    expect(redactValue(42)).toBe(42);
    expect(redactValue(false)).toBe(false);
  });

  it('redacts api_key field regardless of casing', () => {
    const result = redactValue({ api_key: 'key123', apiKey: 'key456' }) as any;
    expect(result.api_key).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
  });

  it('redacts secret field', () => {
    const result = redactValue({ secret: 's3cr3t' }) as any;
    expect(result.secret).toBe('[REDACTED]');
  });

  it('redacts authorization field', () => {
    const result = redactValue({ authorization: 'Bearer token123' }) as any;
    expect(result.authorization).toBe('[REDACTED]');
  });
});

describe('detectPiiRegions', () => {
  it('detects OCR blocks that contain PII', () => {
    const blocks: OCRTextBlock[] = [
      { text: 'Name: Alice', bbox: { x: 0, y: 0, width: 100, height: 20 } },
      { text: 'Email: user@test.com', bbox: { x: 0, y: 20, width: 200, height: 20 } },
      { text: 'SSN: 123-45-6789', bbox: { x: 0, y: 40, width: 150, height: 20 } },
    ];
    const pii = detectPiiRegions(blocks);
    expect(pii).toHaveLength(2);
    expect(pii.some((b) => b.text.includes('@'))).toBe(true);
    expect(pii.some((b) => b.text.includes('SSN'))).toBe(true);
  });

  it('returns empty array when no PII detected', () => {
    const blocks: OCRTextBlock[] = [
      { text: 'Hello World', bbox: { x: 0, y: 0, width: 100, height: 20 } },
    ];
    expect(detectPiiRegions(blocks)).toHaveLength(0);
  });
});

describe('buildMaskOperations', () => {
  const blocks: OCRTextBlock[] = [
    { text: 'user@example.com', bbox: { x: 10, y: 20, width: 180, height: 25 } },
    { text: 'Clean text', bbox: { x: 10, y: 50, width: 100, height: 25 } },
  ];

  it('produces mask operation for PII block', () => {
    const ops = buildMaskOperations(blocks);
    expect(ops).toHaveLength(1);
    expect(ops[0].type).toBe('blur');
    expect(ops[0].x).toBe(10);
    expect(ops[0].y).toBe(20);
    expect(ops[0].width).toBe(180);
    expect(ops[0].height).toBe(25);
  });

  it('supports mask mode', () => {
    const ops = buildMaskOperations(blocks, 'mask');
    expect(ops[0].type).toBe('mask');
  });

  it('returns empty array when no PII blocks', () => {
    const clean: OCRTextBlock[] = [
      { text: 'No PII here', bbox: { x: 0, y: 0, width: 100, height: 20 } },
    ];
    expect(buildMaskOperations(clean)).toHaveLength(0);
  });
});
