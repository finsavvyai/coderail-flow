import { describe, it, expect } from 'vitest';
import {
  CreateRunSchema,
  CreateProjectSchema,
  CreateScreenSchema,
  CreateElementSchema,
  CreateFlowSchema,
  CreateFlowFromTemplateSchema,
} from './schemas.js';

describe('CreateRunSchema', () => {
  it('accepts valid input', () => {
    const result = CreateRunSchema.safeParse({ flowId: 'f-123', params: { x: 1 } });
    expect(result.success).toBe(true);
  });

  it('defaults params to empty object', () => {
    const result = CreateRunSchema.safeParse({ flowId: 'f-123' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.params).toEqual({});
  });

  it('rejects missing flowId', () => {
    expect(CreateRunSchema.safeParse({ params: {} }).success).toBe(false);
  });

  it('rejects empty string flowId', () => {
    expect(CreateRunSchema.safeParse({ flowId: '' }).success).toBe(false);
  });
});

describe('CreateProjectSchema', () => {
  it('accepts valid input', () => {
    const result = CreateProjectSchema.safeParse({
      name: 'My App',
      baseUrl: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('defaults orgId to "default"', () => {
    const result = CreateProjectSchema.safeParse({ name: 'App', baseUrl: 'https://x.com' });
    if (result.success) expect(result.data.orgId).toBe('default');
  });

  it('defaults env to "dev"', () => {
    const result = CreateProjectSchema.safeParse({ name: 'App', baseUrl: 'https://x.com' });
    if (result.success) expect(result.data.env).toBe('dev');
  });

  it('rejects invalid URL', () => {
    expect(CreateProjectSchema.safeParse({ name: 'App', baseUrl: 'not-a-url' }).success).toBe(
      false
    );
  });

  it('rejects invalid env value', () => {
    expect(
      CreateProjectSchema.safeParse({ name: 'App', baseUrl: 'https://x.com', env: 'qa' }).success
    ).toBe(false);
  });

  it('accepts all valid env values', () => {
    for (const env of ['dev', 'stage', 'prod']) {
      expect(
        CreateProjectSchema.safeParse({ name: 'App', baseUrl: 'https://x.com', env }).success
      ).toBe(true);
    }
  });

  it('rejects empty name', () => {
    expect(CreateProjectSchema.safeParse({ name: '', baseUrl: 'https://x.com' }).success).toBe(
      false
    );
  });
});

describe('CreateScreenSchema', () => {
  it('accepts valid input', () => {
    const result = CreateScreenSchema.safeParse({ projectId: 'p-1', name: 'Home', urlPath: '/' });
    expect(result.success).toBe(true);
  });

  it('rejects missing projectId', () => {
    expect(CreateScreenSchema.safeParse({ name: 'Home', urlPath: '/' }).success).toBe(false);
  });

  it('rejects empty urlPath', () => {
    expect(
      CreateScreenSchema.safeParse({ projectId: 'p-1', name: 'Home', urlPath: '' }).success
    ).toBe(false);
  });
});

describe('CreateElementSchema', () => {
  const validLocator = { type: 'testid', value: 'btn' };

  it('accepts valid input', () => {
    const result = CreateElementSchema.safeParse({
      screenId: 's-1',
      name: 'Submit',
      locatorPrimary: validLocator,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid locator types', () => {
    for (const type of ['testid', 'role', 'label', 'css', 'xpath']) {
      const result = CreateElementSchema.safeParse({
        screenId: 's-1',
        name: 'El',
        locatorPrimary: { type, value: 'x' },
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid locator type', () => {
    expect(
      CreateElementSchema.safeParse({
        screenId: 's-1',
        name: 'El',
        locatorPrimary: { type: 'id', value: 'x' },
      }).success
    ).toBe(false);
  });

  it('validates reliabilityScore range', () => {
    expect(
      CreateElementSchema.safeParse({
        screenId: 's-1',
        name: 'El',
        locatorPrimary: validLocator,
        reliabilityScore: 1.5,
      }).success
    ).toBe(false);
    expect(
      CreateElementSchema.safeParse({
        screenId: 's-1',
        name: 'El',
        locatorPrimary: validLocator,
        reliabilityScore: 0.9,
      }).success
    ).toBe(true);
  });
});

describe('CreateFlowSchema', () => {
  it('accepts valid input', () => {
    const result = CreateFlowSchema.safeParse({
      projectId: 'p-1',
      name: 'Login Flow',
      definition: { params: [], steps: [{ type: 'goto', url: 'https://x.com' }] },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty steps array', () => {
    expect(
      CreateFlowSchema.safeParse({
        projectId: 'p-1',
        name: 'Flow',
        definition: { params: [], steps: [] },
      }).success
    ).toBe(false);
  });

  it('accepts valid param types', () => {
    const result = CreateFlowSchema.safeParse({
      projectId: 'p-1',
      name: 'F',
      definition: {
        params: [{ name: 'x', type: 'string', required: true }],
        steps: [{ type: 'goto' }],
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('CreateFlowFromTemplateSchema', () => {
  it('accepts valid input', () => {
    const result = CreateFlowFromTemplateSchema.safeParse({ templateId: 't-1', projectId: 'p-1' });
    expect(result.success).toBe(true);
  });

  it('rejects missing templateId', () => {
    expect(CreateFlowFromTemplateSchema.safeParse({ projectId: 'p-1' }).success).toBe(false);
  });

  it('defaults params to empty object', () => {
    const result = CreateFlowFromTemplateSchema.safeParse({ templateId: 't-1', projectId: 'p-1' });
    if (result.success) expect(result.data.params).toEqual({});
  });
});
