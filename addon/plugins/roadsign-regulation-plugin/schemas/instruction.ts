import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { IBindings } from 'fetch-sparql-endpoint';

export default class Instruction {
  constructor(
    readonly name: string,
    readonly template: string,
    readonly annotatedTemplate: string,
  ) {}

  static fromBinding(binding: IBindings) {
    return new Instruction(
      unwrap(binding['name']?.value),
      unwrap(binding['template']?.value),
      unwrap(binding['annotatedTemplate']?.value),
    );
  }
}
