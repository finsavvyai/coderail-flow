import { z } from 'zod';
import { FlowSchema } from './index';

export const TemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  flow: FlowSchema,
});

export type Template = z.infer<typeof TemplateSchema>;
