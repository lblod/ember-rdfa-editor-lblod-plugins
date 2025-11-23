import { z } from 'zod';
import {
  TrafficSignalConcept,
  TrafficSignalConceptSchema,
} from './traffic-signal-concept';

export const TrafficSignalSchema = z.object({
  uri: z.string(),
  trafficSignalConcept: TrafficSignalConceptSchema,
});

export type TrafficSignal = z.infer<typeof TrafficSignalSchema>;

export function isTrafficSignal(
  signalOrSignalConcept: TrafficSignal | TrafficSignalConcept,
): signalOrSignalConcept is TrafficSignal {
  return 'trafficSignalConcept' in signalOrSignalConcept;
}
