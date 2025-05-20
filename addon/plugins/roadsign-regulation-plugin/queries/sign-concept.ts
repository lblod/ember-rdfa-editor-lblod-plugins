import {
  BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { SignConcept, SignConceptSchema } from '../schemas/sign-concept';
import queryRoadSignCategories from './road-sign-category';
import { SIGN_CONCEPT_TYPES } from '../constants';

type QueryOptions = {
  imageBaseUrl?: string;
  measureConceptUri?: string;
  abortSignal?: AbortSignal;
};

export async function querySignConcepts(
  endpoint: string,
  options: QueryOptions = {},
) {
  const { imageBaseUrl, measureConceptUri, abortSignal } = options;
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT DISTINCT
      ?uri
      ?type
      ?code
      ?zonality
      (CONCAT(${sparqlEscapeString(imageBaseUrl ?? '')}, "/files/", ?imageId, "/download") AS ?image)
    WHERE {
      ?uri
        a mobiliteit:Verkeerstekenconcept;
        a ?type;
        skos:prefLabel ?code;
        mobiliteit:grafischeWeergave ?imageUri.

      ?imageUri ext:hasFile/mu:uuid ?imageId.

      OPTIONAL {
        ?uri ext:zonality ?zonality.
      }

      VALUES ?type {
        <https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept>
        <https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept>
        <https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept>
      }

      ${measureConceptUri ? `?uri mobiliteit:heeftMaatregelconcept ${sparqlEscapeUri(measureConceptUri)}` : ''}
    }
  `;
  const queryResult = await executeQuery<BindingObject<SignConcept>>({
    query,
    endpoint,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  const concepts = SignConceptSchema.array().parse(bindings.map(objectify));
  const conceptsWithCategories = await Promise.all(
    concepts.map(async (concept) => {
      if (concept.type === SIGN_CONCEPT_TYPES.ROAD_SIGN) {
        const categories = await queryRoadSignCategories(endpoint, {
          roadSignConceptUri: concept.uri,
        });
        return {
          ...concept,
          categories,
        };
      } else {
        return concept;
      }
    }),
  );
  return conceptsWithCategories;
}
