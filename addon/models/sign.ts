import { IBindings } from 'fetch-sparql-endpoint';
import { unwrap } from '../utils/option';

export default class Sign {
  constructor(
    readonly code: string,
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

    const uri = unwrap(binding['uri']?.value);
    const order = unwrap(binding['order']?.value);

    const classifications = binding['classifications']?.value.split('|') ?? [];
    const zonality = binding['zonality']?.value;
    return new Sign(code, image, classifications, uri, order, zonality);
  }

  static processImage(url: string, imageBaseUrl: string) {
    const isAbsoluteRegex = new RegExp('^(?:[a-z]+:)?//', 'i');
    if (isAbsoluteRegex.test(url)) {
      return url;
    } else {
      return `${imageBaseUrl}${url}`;
    }
  }
}
