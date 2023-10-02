declare module '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid' {
  import ObjectProxy from '@ember/object/proxy';
  import BestuurseenheidClassificatieCodeModel from '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid-classificatie';

  export default class BestuurseenheidModel extends ObjectProxy {
    naam: string;
    uri: string;

    classificatie: Promise<BestuurseenheidClassificatieCodeModel>;

    rdfaBindings: Record<string, string>;
  }
}
