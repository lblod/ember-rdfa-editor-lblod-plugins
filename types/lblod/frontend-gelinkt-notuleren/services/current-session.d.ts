declare module '@lblod/frontend-gelinkt-notuleren/services/current-session' {
  import Service from '@ember/service';
  import AccountModel from '@lblod/frontend-gelinkt-notuleren/models/account';
  import GebruikerModel from '@lblod/frontend-gelinkt-notuleren/models/gebruiker';
  import BestuurseenheidModel from '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid';

  export default class CurrentSessionService extends Service {
    session: Service;

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
