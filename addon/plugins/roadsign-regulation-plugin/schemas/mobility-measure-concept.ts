import { SignConceptSchema } from './sign-concept';
import { z } from 'zod';

export const MobilityMeasureConceptSchema = z.object({
  uri: z.string(),
  label: z.string(),
  preview: z.string(),
  zonality: z.string(),
  temporal: z.boolean().optional(),
  signConcepts: z.array(SignConceptSchema).default([]),
});

export type MobilityMeasureConcept = z.infer<
  typeof MobilityMeasureConceptSchema
>;
