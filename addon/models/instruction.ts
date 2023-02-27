import { IBindings } from 'fetch-sparql-endpoint';
import { unwrap } from '../utils/option';

export default class Instruction {
  constructor(
    readonly name: string,
    readonly template: string,
    readonly annotatedTemplate: string
  ) {}

  static fromBinding(binding: IBindings) {
    return new Instruction(
      unwrap(binding['name']?.value),
      unwrap(binding['template']?.value),
      unwrap(binding['annotatedTemplate']?.value)
    );
  }
}
