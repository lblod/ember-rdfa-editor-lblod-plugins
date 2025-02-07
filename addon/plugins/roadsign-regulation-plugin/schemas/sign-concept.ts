import { z } from 'zod';
import { SIGN_CONCEPT_TYPES, ZONALITY_OPTIONS } from '../constants';

export const SignConceptSchema = z.object({
  uri: z.string(),
  code: z.string(),
  type: z.nativeEnum(SIGN_CONCEPT_TYPES),
  image: z.string(),
  classifications: z.array(z.string()).default([]),
  zonality: z.nativeEnum(ZONALITY_OPTIONS).optional(),
});

export type SignConcept = z.infer<typeof SignConceptSchema>;
