import { z } from 'zod';
import { TrafficSignalSchema } from './traffic-signal';
import {
  type MobilityMeasureConcept,
  MobilityMeasureConceptSchema,
} from './mobility-measure-concept';

export const MobilityMeasurePreviewSchema = z.object({
  uri: z.string(),
  trafficSignals: z.array(TrafficSignalSchema),
  measureConcept: MobilityMeasureConceptSchema,
});

export type MobilityMeasurePreview = z.infer<
  typeof MobilityMeasurePreviewSchema
>;

export function isMobilityMeasurePreview(
  conceptOrPreview: MobilityMeasureConcept | MobilityMeasurePreview,
): conceptOrPreview is MobilityMeasurePreview {
  return 'measureConcept' in conceptOrPreview;
}
