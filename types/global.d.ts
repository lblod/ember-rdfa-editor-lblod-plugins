// Types for compiled templates
declare module '@lblod/ember-rdfa-editor-lblod-plugins/templates/*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';

  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@lblod/ember-address-search' {
  import Service from '@ember/service';

  export interface Address {
    uri: string;
    addressRegisterId: string;
    fullAddress: string;
    street: string;
    housenumber: string;
    busNumber: string | null;
    zipCode: string;
    municipality: string;
  }

  export interface AddressSuggestion {
    addressRegisterId: number;
    fullAddress: string;
    housenumber: string;
    municipality: string;
    street: string;
    zipCode: string;
  }

  export default class AddressRegister extends Service {
    constructor();
    setup(options: { endpoint: string }): void;
    findAll(suggestion: AddressSuggestion): Promise<Address[]>;
    suggest(term: string): Promise<AddressSuggestion[]>;
  }
}
