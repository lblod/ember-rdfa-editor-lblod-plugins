import {
  BindingObject,
  executeQuery,
  objectify,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import {
  RoadSignCategory,
  RoadSignCategorySchema,
} from '../schemas/road-sign-category';

type QueryOptions = {
  abortSignal?: AbortSignal;
};

export default async function queryRoadSignCategories(
  endpoint: string,
  options: QueryOptions = {},
) {
  const { abortSignal } = options;
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT
      ?uri
      ?label
    WHERE {
      ?uri a mobiliteit:Verkeersbordcategorie;
           skos:prefLabel ?label.
    }
  `;
  const queryResult = await executeQuery<BindingObject<RoadSignCategory>>({
    endpoint,
    query,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  return RoadSignCategorySchema.array().parse(bindings.map(objectify));
}
