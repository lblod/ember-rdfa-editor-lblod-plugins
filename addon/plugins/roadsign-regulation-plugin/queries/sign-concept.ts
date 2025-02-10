import {
  BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { SignConcept, SignConceptSchema } from '../schemas/sign-concept';

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
      (GROUP_CONCAT(?classification; SEPARATOR="|") AS ?classifications)
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
      OPTIONAL {
        ?uri dct:type/skos:prefLabel ?classification.
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
  const processed = bindings.map(objectify).map((binding) => {
    return {
      ...binding,
      classifications: binding.classifications
        ? binding.classifications.split('|')
        : [],
    };
  });
  return SignConceptSchema.array().parse(processed);
}
