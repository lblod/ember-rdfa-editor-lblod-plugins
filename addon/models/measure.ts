import { tracked } from '@glimmer/tracking';
import { IBindings } from 'fetch-sparql-endpoint';
import { unwrap } from '../utils/option';
import Sign from './sign';

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
