import { z } from 'zod';
import { SIGN_CONCEPT_TYPES, ZONALITY_OPTIONS } from '../constants';
import { RoadSignCategorySchema } from './road-sign-category';

export const SignConceptSchema = z
  .object({
    uri: z.string(),
    code: z.string(),
    image: z.string(),
    zonality: z.nativeEnum(ZONALITY_OPTIONS).optional(),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal(SIGN_CONCEPT_TYPES.ROAD_SIGN),
        categories: z.array(RoadSignCategorySchema).default([]),
      }),
      z.object({
        type: z.enum([
          SIGN_CONCEPT_TYPES.ROAD_MARKING,
          SIGN_CONCEPT_TYPES.TRAFFIC_LIGHT,
        ]),
      }),
    ]),
  );

export type SignConcept = z.infer<typeof SignConceptSchema>;
