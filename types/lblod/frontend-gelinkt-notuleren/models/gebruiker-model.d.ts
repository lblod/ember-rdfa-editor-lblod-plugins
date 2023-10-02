declare module '@lblod/frontend-gelinkt-notuleren/models/gebruiker' {
  import { ArrayProxy } from '@ember/object';
  import ObjectProxy from '@ember/object/proxy';
  import AccountModel from '@lblod/frontend-gelinkt-notuleren/models/account';
  import BestuurseenheidModel from '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid';

  export default class GebruikerModel extends ObjectProxy {
    voornaam: string;
    achternaam: string;
    rijksregisterNummer: string;

    account: Promise<ArrayProxy<AccountModel>>;

    bestuurseenheden: Promise<ArrayProxy<BestuurseenheidModel>>;

    // this is only used for mock login afaik
    get group(): BestuurseenheidModel;
    get fullName(): string;
  }
}
