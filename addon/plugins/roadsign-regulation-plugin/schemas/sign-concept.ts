import { z } from 'zod';

export const SignConceptSchema = z.object({
  uri: z.string(),
  code: z.string(),
  type: z.string(),
  image: z.string(),
  classifications: z.array(z.string()).default([]),
  zonality: z.string().optional(),
});

export type SignConcept = z.infer<typeof SignConceptSchema>;
