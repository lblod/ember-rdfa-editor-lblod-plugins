import {
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import {
  MobilityMeasureConcept,
  MobilityMeasureConceptSchema,
} from '../schemas/mobility-measure-concept';
import { z } from 'zod';
import { querySignConcepts } from './sign-concept';
import { ZONALITY_OPTIONS } from '../constants';

type QueryOptions<Count extends boolean = boolean> = {
  imageBaseUrl?: string;
  searchString?: string;
  zonality?: string;
  signType?: string;
  codes?: string[];
  category?: string;
  page?: number;
  pageSize?: number;
  abortSignal?: AbortSignal;
  count: Count;
};

type Result<Count extends boolean> = Count extends true
  ? number
  : MobilityMeasureConcept[];

function _buildFilters(
  options: Omit<QueryOptions, 'page' | 'pageSize' | 'abortSignal' | 'count'>,
) {
  const { zonality, signType, codes, category, searchString } = options;
  const filters = [];
  if (zonality) {
    filters.push(
      `FILTER(?zonality IN (${sparqlEscapeUri(zonality)}, ${sparqlEscapeUri(ZONALITY_OPTIONS.POTENTIALLY_ZONAL)}))`,
    );
  }
  if (signType) {
    filters.push(`FILTER(?signType = ${sparqlEscapeUri(signType)})`);
  }
  if (codes) {
    filters.push(`
        ${codes
          .map(
            (uri) => `
              ${sparqlEscapeUri(uri)} mobiliteit:heeftMaatregelconcept ?uri.
            `,
          )
          .join(' ')}
    `);
  }
  if (category) {
    filters.push(`FILTER(?signClassification = ${sparqlEscapeUri(category)})`);
  }

  if (searchString) {
    filters.push(
      `
      FILTER(BOUND(?preview))
      FILTER(CONTAINS(UCASE(STR(?preview)), UCASE(${sparqlEscapeString(searchString)})))`,
    );
  }
  return filters;
}

async function _queryMobilityMeasures<Count extends boolean>(
  endpoint: string,
  options: QueryOptions<Count>,
): Promise<Result<Count>> {
  const { page = 0, pageSize = 10, count, imageBaseUrl, abortSignal } = options;
  const selectStatement = count
    ? /* sparql */ `SELECT (COUNT(DISTINCT(?uri)) AS ?count)`
    : /* sparql */ `SELECT DISTINCT ?uri ?label ?preview ?zonality ?variableSignage`;

  const filterStatement = _buildFilters(options).join('\n');
  const orderByStatement = !count
    ? /* sparql */ `ORDER BY ASC(strlen(str(?label))) ASC(?label)`
    : '';
  const paginationStatement = !count
    ? /* sparql */ `LIMIT ${pageSize} OFFSET ${page * pageSize}`
    : '';
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX dct: <http://purl.org/dc/terms/>

    ${selectStatement}
    WHERE {
      ?uri
        a mobiliteit:Mobiliteitmaatregelconcept;
        skos:prefLabel ?label;
        ext:zonality ?zonality;
        mobiliteit:Mobiliteitsmaatregelconcept.template ?templateUri.

      ?templateUri ext:preview ?preview.

      ?signUri
        a ?signType;
        mobiliteit:heeftMaatregelconcept ?uri;
        skos:prefLabel ?signCode.

      OPTIONAL {
        ?uri mobiliteit:variabeleSignalisatie ?variableSignage.
      }
      OPTIONAL {
        ?signUri dct:type ?signClassification.
      }
      ${filterStatement}
    }
    ${orderByStatement}
    ${paginationStatement}
  `;

  const queryResult = await executeQuery({
    query,
    endpoint,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  if (count) {
    // @ts-expect-error don't know how to fix this error
    return z.number({ coerce: true }).parse(bindings[0].count.value);
  } else {
    const concepts = MobilityMeasureConceptSchema.array().parse(
      bindings.map((binding) => {
        const objectified = objectify(binding);
        return {
          ...objectified,
          variableSignage:
            objectified.variableSignage === '1' ||
            objectified.variableSignage === 'true',
        };
      }),
    );
    const conceptsWithSigns = await Promise.all(
      concepts.map(async (concept) => {
        const signConcepts = await querySignConcepts(endpoint, {
          measureConceptUri: concept.uri,
          imageBaseUrl,
        });
        return {
          ...concept,
          signConcepts,
        };
      }),
    );
    // @ts-expect-error don't know how to fix this error
    return conceptsWithSigns;
  }
}

export async function queryMobilityMeasures(
  endpoint: string,
  options: Omit<QueryOptions, 'count'> = {},
) {
  return _queryMobilityMeasures(endpoint, { ...options, count: false });
}

export function countMobilityMeasures(
  endpoint: string,
  options: Omit<QueryOptions, 'count' | 'page' | 'pageSize'> = {},
) {
  return _queryMobilityMeasures(endpoint, { ...options, count: true });
}
