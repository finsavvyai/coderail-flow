import { describe, it, expect } from 'vitest';
import { parseSkillManifest, SkillRegistry } from './skill-manifest';

describe('parseSkillManifest', () => {
  it('parses a valid manifest', () => {
    const manifest = parseSkillManifest({
      name: 'screenshot-diff',
      version: '1.0.0',
      description: 'Visual comparison step',
      author: 'coderailflow',
      permissions: ['browser-interact'],
      steps: [
        {
          name: 'visual-compare',
          description: 'Compare current page to baseline',
          inputSchema: { type: 'object', properties: { threshold: { type: 'number' } } },
        },
      ],
    });

    expect(manifest.name).toBe('screenshot-diff');
    expect(manifest.steps).toHaveLength(1);
    expect(manifest.steps[0].requiredPermission).toBe('browser-interact');
  });

  it('applies defaults for optional fields', () => {
    const manifest = parseSkillManifest({
      name: 'basic-skill',
      version: '0.1.0',
      description: 'Minimal skill',
      author: 'test',
    });

    expect(manifest.defaultEnabled).toBe(true);
    expect(manifest.license).toBe('MIT');
    expect(manifest.tags).toEqual([]);
    expect(manifest.hooks.beforeStep).toEqual([]);
    expect(manifest.steps).toEqual([]);
  });

  it('rejects invalid version format', () => {
    expect(() =>
      parseSkillManifest({
        name: 'bad',
        version: 'v1',
        description: 'test',
        author: 'test',
      })
    ).toThrow();
  });

  it('rejects invalid permissions', () => {
    expect(() =>
      parseSkillManifest({
        name: 'bad',
        version: '1.0.0',
        description: 'test',
        author: 'test',
        permissions: ['root-access'],
      })
    ).toThrow();
  });
});

describe('SkillRegistry', () => {
  it('registers and retrieves skills', () => {
    const registry = new SkillRegistry();
    const manifest = parseSkillManifest({
      name: 'test-skill',
      version: '1.0.0',
      description: 'Test',
      author: 'test',
      steps: [{ name: 'custom-click', description: 'Click with retry', inputSchema: {} }],
    });

    registry.register(manifest);
    expect(registry.size).toBe(1);
    expect(registry.get('test-skill')).toBeDefined();
  });

  it('resolves step types across skills', () => {
    const registry = new SkillRegistry();
    registry.register(
      parseSkillManifest({
        name: 'skill-a',
        version: '1.0.0',
        description: 'A',
        author: 'test',
        steps: [{ name: 'step-a', description: 'A step', inputSchema: {} }],
      })
    );
    registry.register(
      parseSkillManifest({
        name: 'skill-b',
        version: '1.0.0',
        description: 'B',
        author: 'test',
        steps: [{ name: 'step-b', description: 'B step', inputSchema: {} }],
      })
    );

    const result = registry.resolveStep('step-b');
    expect(result).toBeDefined();
    expect(result!.skill.name).toBe('skill-b');
    expect(result!.step.name).toBe('step-b');
  });

  it('returns undefined for unknown step types', () => {
    const registry = new SkillRegistry();
    expect(registry.resolveStep('unknown')).toBeUndefined();
  });

  it('lists all step types', () => {
    const registry = new SkillRegistry();
    registry.register(
      parseSkillManifest({
        name: 'multi',
        version: '1.0.0',
        description: 'Multi-step',
        author: 'test',
        steps: [
          { name: 'step-1', description: 'First', inputSchema: {} },
          { name: 'step-2', description: 'Second', inputSchema: {} },
        ],
      })
    );

    expect(registry.allStepTypes()).toHaveLength(2);
  });
});
