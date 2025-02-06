import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { IBindings } from 'fetch-sparql-endpoint';
import { z } from 'zod';

export default class Sign {
  constructor(
    readonly code: string,
    readonly type: string,
    readonly image: string,
    readonly classifications: string[] = [],
    readonly uri: string,
    readonly order: string,
    readonly zonality?: string,
  ) {}
  static fromBinding(binding: IBindings) {
    const code = unwrap(binding['code']?.value);
    const image = Sign.processImage(
      unwrap(binding['image']?.value),
      unwrap(binding['imageBaseUrl']?.value),
    );

    const type = unwrap(binding['type']?.value);
    const uri = unwrap(binding['uri']?.value);
    // const order = unwrap(binding['order']?.value);

    const classifications = binding['classifications']?.value.split('|') ?? [];
    const zonality = binding['zonality']?.value;

    return new Sign(code, type, image, classifications, uri, '', zonality);
  }

  static processImage(imageId: string, imageBaseUrl: string) {
    return `${imageBaseUrl}/files/${imageId}/download`;
  }
}

export const SignConceptSchema = z.object({
  uri: z.string(),
  code: z.string(),
  type: z.string(),
  image: z.string(),
  classifications: z.array(z.string()).default([]),
  zonality: z.string().optional(),
});

export type SignConcept = z.infer<typeof SignConceptSchema>;
