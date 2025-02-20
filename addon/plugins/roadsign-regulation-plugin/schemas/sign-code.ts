import { z } from 'zod';

export const SignCodeSchema = z.object({
  uri: z.string(),
  label: z.string(),
});

export type SignCode = z.infer<typeof SignCodeSchema>;
