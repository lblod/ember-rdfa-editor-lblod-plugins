import { IBindings } from 'fetch-sparql-endpoint';
import { unwrap } from '../utils/option';

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
    const uri = unwrap(binding['relatedTrafficSignConcepts']?.value);
    // const order = unwrap(binding['order']?.value);

    const classifications = binding['classifications']?.value.split('|') ?? [];
    const zonality = binding['zonality']?.value;

    return new Sign(code, type, image, classifications, uri, '', zonality);
  }

  static processImage(imageId: string, imageBaseUrl: string) {
    return `${imageBaseUrl}/files/${imageId}/download`;
  }
}
