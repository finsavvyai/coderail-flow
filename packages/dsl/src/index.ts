import { z } from 'zod';

export const FlowParamSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  required: z.boolean().default(true),
});

const GotoStepSchema = z.object({
  type: z.literal('goto'),
  url: z.string().url().optional(),
  screenId: z.string().optional(),
  narrate: z.string().optional(),
});

export const StepSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('caption'),
    text: z.string().min(1),
    placement: z.enum(['top', 'center', 'bottom']).optional(),
  }),
  z.object({ type: z.literal('pause'), ms: z.number().int().min(0) }),
  GotoStepSchema,
  z.object({ type: z.literal('click'), elementId: z.string(), narrate: z.string().optional() }),
  z.object({
    type: z.literal('fill'),
    elementId: z.string(),
    value: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('waitFor'),
    elementId: z.string(),
    state: z.enum(['visible', 'attached', 'hidden']).default('visible'),
  }),
  z.object({
    type: z.literal('highlight'),
    elementId: z.string(),
    style: z.enum(['box', 'pulse']).default('box'),
    narrate: z.string().optional(),
  }),
  // Advanced step types
  z.object({
    type: z.literal('selectRow'),
    elementId: z.string(),
    matchText: z.string(),
    column: z.number().optional(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('assertText'),
    text: z.string(),
    elementId: z.string().optional(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('screenshot'),
    label: z.string().optional(),
    fullPage: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('scroll'),
    direction: z.enum(['up', 'down', 'top', 'bottom']),
    elementId: z.string().optional(),
    pixels: z.number().optional(),
  }),
  z.object({ type: z.literal('hover'), elementId: z.string(), narrate: z.string().optional() }),
  z.object({
    type: z.literal('select'),
    elementId: z.string(),
    value: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('setCookies'),
    cookies: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
        domain: z.string(),
        path: z.string().optional(),
        secure: z.boolean().optional(),
        httpOnly: z.boolean().optional(),
      })
    ),
  }),
  // New enhanced step types
  z.object({
    type: z.literal('keyboard'),
    keys: z.string(),
    elementId: z.string().optional(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('fileUpload'),
    elementId: z.string(),
    filePath: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('dragDrop'),
    sourceElementId: z.string(),
    targetElementId: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('rightClick'),
    elementId: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('doubleClick'),
    elementId: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('iframe'),
    frameSelector: z.string(),
    steps: z.array(z.any()),
    narrate: z.string().optional(),
  }),
  z.object({ type: z.literal('waitForNavigation'), timeout: z.number().optional() }),
  z.object({
    type: z.literal('waitForNetwork'),
    urlPattern: z.string().optional(),
    timeout: z.number().optional(),
  }),
  z.object({
    type: z.literal('executeScript'),
    script: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({ type: z.literal('assertUrl'), pattern: z.string(), narrate: z.string().optional() }),
  z.object({
    type: z.literal('assertElement'),
    elementId: z.string(),
    assertion: z.enum(['exists', 'notExists', 'visible', 'hidden', 'enabled', 'disabled']),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('clearInput'),
    elementId: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({ type: z.literal('focus'), elementId: z.string(), narrate: z.string().optional() }),
  z.object({ type: z.literal('blur'), elementId: z.string(), narrate: z.string().optional() }),
  z.object({
    type: z.literal('setViewport'),
    width: z.number(),
    height: z.number(),
    isMobile: z.boolean().optional(),
  }),
  z.object({ type: z.literal('emulateDevice'), device: z.string() }),
  z.object({
    type: z.literal('pdf'),
    filename: z.string().optional(),
    format: z.enum(['A4', 'Letter', 'Legal']).optional(),
  }),
  z.object({
    type: z.literal('loop'),
    times: z.number(),
    steps: z.array(z.any()),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('conditional'),
    condition: z.string(),
    thenSteps: z.array(z.any()),
    elseSteps: z.array(z.any()).optional(),
    narrate: z.string().optional(),
  }),
  z.object({
    type: z.literal('extractData'),
    elementId: z.string(),
    attribute: z.string().optional(),
    variableName: z.string(),
    narrate: z.string().optional(),
  }),
  z.object({ type: z.literal('setVariable'), name: z.string(), value: z.string() }),
]);

export const FlowSchema = z.object({
  params: z.array(FlowParamSchema).default([]),
  steps: z.array(StepSchema).min(1),
});

export type Flow = z.infer<typeof FlowSchema>;
export type Step = z.infer<typeof StepSchema>;
export { TemplateSchema } from './template';
export type { Template } from './template';
