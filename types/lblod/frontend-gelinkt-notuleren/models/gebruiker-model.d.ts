declare module '@lblod/frontend-gelinkt-notuleren/models/gebruiker' {
  import Model, { AsyncHasMany } from '@ember-data/model';
  import AccountModel from '@lblod/frontend-gelinkt-notuleren/models/account';
  import BestuurseenheidModel from '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid';
  export default class GebruikerModel extends Model {
    voornaam: string;
    achternaam: string;
    rijksregisterNummer: string;

    account: AsyncHasMany<AccountModel>;

    bestuurseenheden: AsyncHasMany<BestuurseenheidModel>;

    // this is only used for mock login afaik
    get group(): BestuurseenheidModel;
    get fullName(): string;
  }
}
