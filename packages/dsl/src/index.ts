import { z } from "zod";

export const FlowParamSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string","number","boolean","json"]).default("string"),
  required: z.boolean().default(true)
});

const GotoStepSchema = z.object({ type: z.literal("goto"), url: z.string().url().optional(), screenId: z.string().optional(), narrate: z.string().optional() });

export const StepSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("caption"), text: z.string().min(1) }),
  z.object({ type: z.literal("pause"), ms: z.number().int().min(0) }),
  GotoStepSchema,
  z.object({ type: z.literal("click"), elementId: z.string() }),
  z.object({ type: z.literal("fill"), elementId: z.string(), value: z.string() }),
  z.object({ type: z.literal("waitFor"), elementId: z.string(), state: z.enum(["visible","attached","hidden"]).default("visible") }),
  z.object({ type: z.literal("highlight"), elementId: z.string(), style: z.enum(["box","pulse"]).default("box"), narrate: z.string().optional() })
]);

export const FlowSchema = z.object({
  params: z.array(FlowParamSchema).default([]),
  steps: z.array(StepSchema).min(1)
});

export type Flow = z.infer<typeof FlowSchema>;
export type Step = z.infer<typeof StepSchema>;
