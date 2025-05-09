import { Term } from '@rdfjs/types';
import { unwrap } from '../utils/option';

export default class Electee {
  constructor(
    readonly uri: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly kandidatenlijst?: string,
  ) {}
  static fromBinding(binding: Record<string, Term>) {
    const uri = unwrap(binding['person'].value);
    const firstName = unwrap(binding['firstName'].value);
    const lastName = unwrap(binding['lastName'].value);
    const kandidatenlijst = binding['kandidatenlijstLabel']?.value;
    return new Electee(uri, firstName, lastName, kandidatenlijst);
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
