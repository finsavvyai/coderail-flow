import { z } from 'zod';

export const CreateRunSchema = z.object({
  flowId: z.string().min(1),
  params: z.record(z.any()).default({}),
  definition: z.any().optional(),
  projectId: z.string().optional(),
});

export const CreateProjectSchema = z.object({
  orgId: z.string().optional().default('default'),
  name: z.string().min(1),
  baseUrl: z.string().url(),
  env: z.enum(['dev', 'stage', 'prod']).default('dev'),
});

export const CreateScreenSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  urlPath: z.string().min(1),
});

export const CreateElementSchema = z.object({
  screenId: z.string().min(1),
  name: z.string().min(1),
  locatorPrimary: z.object({
    type: z.enum(['testid', 'role', 'label', 'css', 'xpath']),
    value: z.string().min(1),
    meta: z.record(z.any()).optional(),
  }),
  locatorFallbacks: z
    .array(
      z.object({
        type: z.enum(['testid', 'role', 'label', 'css', 'xpath']),
        value: z.string().min(1),
      })
    )
    .optional(),
  reliabilityScore: z.number().min(0).max(1).optional(),
});

export const CreateFlowSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  authProfileId: z.string().min(1).optional(),
  definition: z.object({
    params: z
      .array(
        z.object({
          name: z.string().min(1),
          type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
          required: z.boolean().default(true),
        })
      )
      .default([]),
    steps: z.array(z.any()).min(1),
  }),
});

export const CreateFlowFromTemplateSchema = z.object({
  templateId: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1).optional(),
  authProfileId: z.string().min(1).optional(),
  params: z.record(z.any()).default({}),
});

export type CreateRunRequest = z.infer<typeof CreateRunSchema>;
export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
export type CreateScreenRequest = z.infer<typeof CreateScreenSchema>;
export type CreateElementRequest = z.infer<typeof CreateElementSchema>;
export type CreateFlowRequest = z.infer<typeof CreateFlowSchema>;
export type CreateFlowFromTemplateRequest = z.infer<typeof CreateFlowFromTemplateSchema>;
