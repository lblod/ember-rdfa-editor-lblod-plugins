import { z } from 'zod';
import { TrafficSignalSchema } from './traffic-signal';
import {
  type MobilityMeasureConcept,
  MobilityMeasureConceptSchema,
} from './mobility-measure-concept';
import { TrafficSignalConceptSchema } from './traffic-signal-concept';

export const MobilityMeasureDesignSchema = z.object({
  uri: z.string(),
  trafficSignals: z.union([
    z.array(TrafficSignalSchema),
    z.array(TrafficSignalConceptSchema),
  ]),
  measureConcept: MobilityMeasureConceptSchema,
});

export type MobilityMeasureDesign = z.infer<typeof MobilityMeasureDesignSchema>;

export function isMobilityMeasureDesign(
  conceptOrDesign: MobilityMeasureConcept | MobilityMeasureDesign,
): conceptOrDesign is MobilityMeasureDesign {
  return 'measureConcept' in conceptOrDesign;
}
