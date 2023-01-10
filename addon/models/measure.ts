import { tracked } from '@glimmer/tracking';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { IBindings } from 'fetch-sparql-endpoint';
import Sign from './sign';

export default class Measure {
  @tracked signs: Sign[] = [];
  classifications = new Set();

  constructor(
    readonly uri: string,
    readonly label: string,
    readonly template: string,
    readonly annotatedTemplate: string,
    readonly zonality: string,
    readonly temporal: string | false,
    signs: Sign[] = []
  ) {
    this.signs = signs;
  }

  static fromBinding(binding: IBindings) {
    const uri = unwrap(binding['uri']?.value);
    const label = unwrap(binding['label']?.value);
    const template = unwrap(binding['basicTemplate']?.value);
    const temporal = binding['temporal']?.value ?? false;
    const annotatedTemplate = unwrap(binding['annotatedTemplate']?.value);
    const zonality = unwrap(binding['zonality']?.value);
    return new Measure(
      uri,
      label,
      template,
      annotatedTemplate,
      zonality,
      temporal
    );
  }
}
