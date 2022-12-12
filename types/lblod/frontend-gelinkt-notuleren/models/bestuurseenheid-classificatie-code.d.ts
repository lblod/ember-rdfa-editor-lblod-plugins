declare module '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid-classificatie' {
  import Model from '@ember-data/model';
  export default class BestuurseenheidClassificatieCodeModel extends Model {
    label: string;
    scopeNote: string;
    uri: string;

    rdfaBindings: Record<string, string>;
  }
}
