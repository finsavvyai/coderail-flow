import { describe, it, expect, vi } from 'vitest';
import { locatorToPuppeteerSelector } from './locator.js';

describe('locatorToPuppeteerSelector', () => {
  it('converts testid locator to attribute selector', () => {
    expect(locatorToPuppeteerSelector({ type: 'testid', value: 'submit-btn' })).toBe(
      '[data-testid="submit-btn"]'
    );
  });

  it('converts role locator without name', () => {
    expect(locatorToPuppeteerSelector({ type: 'role', value: 'button' })).toBe('[role="button"]');
  });

  it('converts role locator with meta.name to aria-label selector', () => {
    expect(
      locatorToPuppeteerSelector({ type: 'role', value: 'button', meta: { name: 'Submit' } })
    ).toBe('[role="button"][aria-label*="Submit"]');
  });

  it('returns css value as-is', () => {
    expect(locatorToPuppeteerSelector({ type: 'css', value: '.my-class > span' })).toBe(
      '.my-class > span'
    );
  });

  it('converts xpath locator with xpath/ prefix', () => {
    expect(locatorToPuppeteerSelector({ type: 'xpath', value: '//button[@id="x"]' })).toBe(
      'xpath///button[@id="x"]'
    );
  });

  it('converts text locator to XPath contains selector', () => {
    expect(locatorToPuppeteerSelector({ type: 'text', value: 'Sign in' })).toBe(
      'xpath///*[contains(text(), "Sign in")]'
    );
  });

  it('throws for unknown locator type', () => {
    expect(() => locatorToPuppeteerSelector({ type: 'unknown' as any, value: 'x' })).toThrow(
      'Unsupported locator type: unknown'
    );
  });

  it('handles special characters in testid values', () => {
    expect(locatorToPuppeteerSelector({ type: 'testid', value: 'btn-123_foo' })).toBe(
      '[data-testid="btn-123_foo"]'
    );
  });

  it('handles empty css value', () => {
    expect(locatorToPuppeteerSelector({ type: 'css', value: '' })).toBe('');
  });

  it('handles role without meta', () => {
    const result = locatorToPuppeteerSelector({ type: 'role', value: 'checkbox' });
    expect(result).toBe('[role="checkbox"]');
    expect(result).not.toContain('aria-label');
  });

  it('handles role with meta but no name property', () => {
    const result = locatorToPuppeteerSelector({
      type: 'role',
      value: 'textbox',
      meta: { other: 'value' },
    });
    expect(result).toBe('[role="textbox"]');
  });
});
