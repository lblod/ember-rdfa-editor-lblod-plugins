declare module '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid' {
  import Model, { AsyncBelongsTo } from '@ember-data/model';
  import BestuurseenheidClassificatieCodeModel from '@lblod/frontend-gelinkt-notuleren/models/bestuurseenheid-classificatie';
  export default class BestuurseenheidModel extends Model {
    naam: string;
    uri: string;

    classificatie: AsyncBelongsTo<BestuurseenheidClassificatieCodeModel>;

    rdfaBindings: Record<string, string>;
  }
}
