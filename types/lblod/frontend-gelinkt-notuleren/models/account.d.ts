declare module '@lblod/frontend-gelinkt-notuleren/models/account' {
  import ObjectProxy from '@ember/object/proxy';
  import GebruikerModel from '@lblod/frontend-gelinkt-notuleren/models/gebruiker';

  export default class AccountModel extends ObjectProxy {
    voId: string;
    provider: string;
    gebruiker: Promise<GebruikerModel>;
  }
}
