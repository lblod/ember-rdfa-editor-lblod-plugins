declare module '@lblod/frontend-gelinkt-notuleren/models/account' {
  import Model, { AsyncBelongsTo } from '@ember-data/model';
  import GebruikerModel from '@lblod/frontend-gelinkt-notuleren/models/gebruiker';

  export default class AccountModel extends Model {
    voId: string;
    provider: string;
    gebruiker: AsyncBelongsTo<GebruikerModel>;
  }
}
