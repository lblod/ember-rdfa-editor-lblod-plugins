declare module '@lblod/frontend-gelinkt-notuleren/services/current-session' {
  import Service from '@ember/service';
  // eslint-disable-next-line ember/use-ember-data-rfc-395-imports
  import DS from 'ember-data';
  import AccountModel from '@lblod/frontend-gelinkt-notuleren/models/account';
  import GebruikerModel from '@lblod/frontend-gelinkt-notuleren/models/gebruiker';
  import BestuurseenheidModel from '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid';

  export default class CurrentSessionService extends Service {
    session: Service;
    store: DS.Store;

    account: AccountModel;
    user: GebruikerModel;
    group: BestuurseenheidModel;
    roles: unknown[];

    get canRead(): boolean;

    get canWrite(): boolean;

    get canPublish(): boolean;

    get canSign(): boolean;

    hasRole(role: unknown): boolean;

    load(): Promise<void>;
  }
}
