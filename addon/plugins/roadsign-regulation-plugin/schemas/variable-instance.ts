import { z } from 'zod';
import {
  CodelistVariableSchema,
  DateVariableSchema,
  LocationVariableSchema,
  NumberVariableSchema,
  TextVariableSchema,
  Variable,
} from './variable';

const BaseVariableInstanceSchema = z.object({
  uri: z.string(),
  id: z.string(),
});

const TextVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.string().optional(),
  variable: TextVariableSchema,
});

const NumberVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.number().optional(),
  variable: NumberVariableSchema,
});

const DateVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.date().optional(),
  variable: DateVariableSchema,
});

const LocationVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.string().optional(),
  variable: LocationVariableSchema,
});

const CodelistVariableInstanceSchema = BaseVariableInstanceSchema.extend({
  value: z.string().optional(),
  variable: CodelistVariableSchema,
});

const VariableInstanceSchema = z.union([
  TextVariableInstanceSchema,
  NumberVariableInstanceSchema,
  DateVariableInstanceSchema,
  LocationVariableInstanceSchema,
  CodelistVariableInstanceSchema,
]);

export type VariableInstance = z.infer<typeof VariableInstanceSchema>;

export function isVariableInstance(
  variableOrVariableInstance: Variable | VariableInstance,
): variableOrVariableInstance is VariableInstance {
  return 'variable' in variableOrVariableInstance;
}
