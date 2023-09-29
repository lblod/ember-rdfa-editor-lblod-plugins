declare module '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid-classificatie' {
  import ObjectProxy from '@ember/object/proxy';

  export default class BestuurseenheidClassificatieCodeModel extends ObjectProxy {
    label: string;
    scopeNote: string;
    uri: string;

    rdfaBindings: Record<string, string>;
  }
}
