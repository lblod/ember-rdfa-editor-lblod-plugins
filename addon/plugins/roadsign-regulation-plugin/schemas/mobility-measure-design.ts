import { z } from 'zod';
import { TrafficSignalSchema } from './traffic-signal';
import {
  type MobilityMeasureConcept,
  MobilityMeasureConceptSchema,
} from './mobility-measure-concept';

export const MobilityMeasureDesignSchema = z.object({
  uri: z.string(),
  trafficSignals: z.array(TrafficSignalSchema),
  measureConcept: MobilityMeasureConceptSchema,
});

export type MobilityMeasureDesign = z.infer<typeof MobilityMeasureDesignSchema>;

export function isMobilityMeasureDesign(
  conceptOrDesign: MobilityMeasureConcept | MobilityMeasureDesign,
): conceptOrDesign is MobilityMeasureDesign {
  return 'measureConcept' in conceptOrDesign;
}
