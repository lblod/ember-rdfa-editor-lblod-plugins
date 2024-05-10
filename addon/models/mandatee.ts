import { tracked } from '@glimmer/tracking';
import { IBindings } from 'fetch-sparql-endpoint';
import { unwrap } from '../utils/option';


export default class Mandatee {
    constructor(
      readonly personUri: string,
      readonly mandateeUri: string,
      readonly firstName: string,
      readonly lastName: string,
      readonly fullName: string,
      readonly status: string,
      readonly fractie: string,
      readonly role: string,

    ) {}
    static fromBinding(binding: IBindings) {
        const personUri = unwrap(binding['person']?.value);
        const mandateeUri = unwrap(binding['mandatee']?.value);
        const firstName = unwrap(binding['firstName']?.value);
        const lastName = unwrap(binding['lastName']?.value);
        const fullName = `${firstName} ${lastName}`
        const status = unwrap(binding['statusLabel']?.value);
        const fractie = unwrap(binding['fractieLabel']?.value);
        const role = unwrap(binding['roleLabel']?.value);
        return new Mandatee(personUri, mandateeUri, firstName, lastName, fullName, status, fractie, role);
    }
  }