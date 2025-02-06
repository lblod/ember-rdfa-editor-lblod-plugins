import {
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { SignCodeSchema } from '../schemas/sign-code';

const DEFAULT_SIGN_TYPES = [
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
  'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept',
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
];

type QueryOptions = {
  searchString?: string;
  roadSignCategory?: string;
  types?: string | string[];
  combinedWith?: string | string[];
};

function buildFilters({
  searchString,
  roadSignCategory,
  types = DEFAULT_SIGN_TYPES,
  combinedWith,
}: QueryOptions) {
  const categoryFilter = roadSignCategory
    ? `?uri dct:type ${sparqlEscapeUri(roadSignCategory)}`
    : '';
  const typesArray = !Array.isArray(types) ? [types] : types;
  const typeFilter = `
    VALUES ?signType {
      ${typesArray.map((type) => sparqlEscapeUri(type)).join(`\n`)}
    }
  `;

  let combinedWithArray: string[];
  if (!Array.isArray(combinedWith)) {
    if (combinedWith) combinedWithArray = [combinedWith];
    else combinedWithArray = [];
  } else {
    combinedWithArray = combinedWith;
  }
  let signFilter = '';
  if (combinedWithArray.length > 0) {
    signFilter = combinedWithArray
      .map(
        (sign) =>
          `${sparqlEscapeUri(sign)} mobiliteit:heeftMaatregelconcept ?measure.`,
      )
      .join('\n');
    signFilter += '\n';
    const commaSeperatedSigns = combinedWithArray
      .map((sign) => `${sparqlEscapeUri(sign)}`)
      .join(',');
    signFilter += `FILTER (?uri NOT IN (${commaSeperatedSigns}))`;
  }

  const searchFilter = searchString
    ? `FILTER(CONTAINS(LCASE(?label), ${sparqlEscapeString(searchString.toLowerCase())}))`
    : '';
  return `
    ${categoryFilter}
    ${typeFilter}
    ${signFilter}
    ${searchFilter}
  `;
}

export default async function querySignCodes(
  endpoint: string,
  options: QueryOptions = {},
) {
  const filterStatement = buildFilters(options);

  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT
      ?uri
      ?label
    WHERE {
      ?uri mobiliteit:heeftMaatregelconcept ?measure.
      ?uri a ?signType;
              skos:prefLabel ?label;
              ext:valid "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>.
      ${filterStatement}
    }
    ORDER BY ASC(?label)
  `;
  const queryResult = await executeQuery({ endpoint, query });
  const bindings = queryResult.results.bindings;
  return SignCodeSchema.array().parse(bindings.map(objectify));
}
