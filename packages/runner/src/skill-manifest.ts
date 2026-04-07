/**
 * Skill manifest system for marketplace custom step types.
 *
 * Adapted from Claw-Code's plugin manifest architecture.
 * Each marketplace skill is a plugin defining custom step types,
 * hooks, and lifecycle events.
 */

import { z } from 'zod';

export type SkillPermission = 'read' | 'browser-interact' | 'network' | 'js-eval';

export const SkillPermissionSchema = z.enum([
  'read',
  'browser-interact',
  'network',
  'js-eval',
]);

export const SkillStepSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  inputSchema: z.record(z.unknown()),
  requiredPermission: SkillPermissionSchema.default('browser-interact'),
});

export const SkillHooksSchema = z.object({
  beforeStep: z.array(z.string()).default([]),
  afterStep: z.array(z.string()).default([]),
});

export const SkillLifecycleSchema = z.object({
  init: z.array(z.string()).default([]),
  teardown: z.array(z.string()).default([]),
});

export const SkillManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string(),
  author: z.string().min(1),
  license: z.string().default('MIT'),
  permissions: z.array(SkillPermissionSchema).default([]),
  defaultEnabled: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  hooks: SkillHooksSchema.default({}),
  lifecycle: SkillLifecycleSchema.default({}),
  steps: z.array(SkillStepSchema).default([]),
});

export type SkillManifest = z.infer<typeof SkillManifestSchema>;
export type SkillStep = z.infer<typeof SkillStepSchema>;
export type SkillHooks = z.infer<typeof SkillHooksSchema>;

/**
 * Validate a raw skill manifest JSON.
 * Returns the validated manifest or throws a ZodError.
 */
export function parseSkillManifest(raw: unknown): SkillManifest {
  return SkillManifestSchema.parse(raw);
}

/**
 * Skill registry for loaded skills.
 * Maps skill name → manifest for step type resolution.
 */
export class SkillRegistry {
  private skills = new Map<string, SkillManifest>();

  register(manifest: SkillManifest): void {
    this.skills.set(manifest.name, manifest);
  }

  unregister(name: string): boolean {
    return this.skills.delete(name);
  }

  get(name: string): SkillManifest | undefined {
    return this.skills.get(name);
  }

  /** Resolve a custom step type to its skill and step definition. */
  resolveStep(stepType: string): { skill: SkillManifest; step: SkillStep } | undefined {
    for (const skill of this.skills.values()) {
      const step = skill.steps.find((s) => s.name === stepType);
      if (step) return { skill, step };
    }
    return undefined;
  }

  /** Get all registered step types across all skills. */
  allStepTypes(): Array<{ skillName: string; step: SkillStep }> {
    const result: Array<{ skillName: string; step: SkillStep }> = [];
    for (const skill of this.skills.values()) {
      for (const step of skill.steps) {
        result.push({ skillName: skill.name, step });
      }
    }
    return result;
  }

  listSkills(): SkillManifest[] {
    return Array.from(this.skills.values());
  }

  get size(): number {
    return this.skills.size;
  }
}
