
declare module '@lblod/frontend-gelinkt-notuleren/models/current-session' {
  import Service, { service } from "@ember/service";
  // eslint-disable-next-line ember/use-ember-data-rfc-395-imports
  import DS from 'ember-data';

  export default class CurrentSessionService extends Service {
    session: Session;
    store: DS.Store;

    account: AccountModel;
    user: UserModel;
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
