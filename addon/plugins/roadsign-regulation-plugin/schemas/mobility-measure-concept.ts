import { tracked } from '@glimmer/tracking';
import { IBindings } from 'fetch-sparql-endpoint';
import Sign, { SignConceptSchema } from './sign-concept';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { z } from 'zod';

export default class Measure {
  @tracked signs: Sign[] = [];
  classifications = new Set();

  constructor(
    readonly uri: string,
    readonly label: string,
    readonly template: string,
    readonly preview: string,
    readonly zonality: string,
    readonly temporal: string | false,
    signs: Sign[] = [],
  ) {
    this.signs = signs;
  }

  static fromBinding(binding: IBindings) {
    const uri = unwrap(binding['uri']?.value);
    const label = unwrap(binding['label']?.value);
    const template = unwrap(binding['template']?.value);
    const temporal = binding['temporal']?.value ?? false;
    const preview = unwrap(binding['preview']?.value);
    const zonality = unwrap(binding['zonality']?.value);
    return new Measure(uri, label, template, preview, zonality, temporal);
  }
}

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
