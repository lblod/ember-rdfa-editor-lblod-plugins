import {
  type BindingObject,
  executeCountQuery,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { WorshipPluginConfig } from '../';

export type WorshipService = {
  uri: string;
  label: string;
};
export interface WorshipServiceResponse {
  results: WorshipService[];
  totalCount: number;
}
export type SearchSort = [keyof WorshipService, 'ASC' | 'DESC'] | false;
export interface SearchMeta {
  filter?: Partial<WorshipService>;
  sort?: SearchSort;
  pageSize: number;
  page: number;
  abortSignal: AbortSignal;
}
export interface FetchWorshipServicesArgs {
  administrativeUnitURI?: string;
  searchMeta: SearchMeta;
  config: WorshipPluginConfig;
}

const emptyWorshipService: WorshipService = {
  uri: '',
  label: '',
};
const selectWorshipService = Object.keys(emptyWorshipService)
  .map((key) => `?${key}`)
  .join(' ');

export async function fetchWorshipServices({
  administrativeUnitURI,
  config: { endpoint },
  searchMeta: { abortSignal, filter, pageSize, page, sort },
}: FetchWorshipServicesArgs): Promise<WorshipServiceResponse> {
  const unitQuery = !administrativeUnitURI
    ? ''
    : `<${administrativeUnitURI}> erediensten:betrokkenBestuur/org:organization ?uri.`;
  const sortQuery = !sort ? '' : `ORDER BY ${sort[1]}(?${sort[0]})`;
  const filterQuery = !filter
    ? ''
    : Object.entries(filter)
        .map(([field, search]) =>
          search?.length > 0
            ? `FILTER(CONTAINS(LCASE(?${field}), LCASE("${search}")))`
            : undefined,
        )
        .filter(Boolean)
        .join('; ');

  const query = `
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX erediensten: <http://data.lblod.info/vocabularies/erediensten/>

    SELECT ${selectWorshipService} WHERE {
      ?uri a erediensten:BestuurVanDeEredienst;
          skos:prefLabel ?label.
      ${unitQuery}
      ${filterQuery}
    }
    ${sortQuery} LIMIT ${pageSize} OFFSET ${page * pageSize}
  `;
  const countQuery = `
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX erediensten: <http://data.lblod.info/vocabularies/erediensten/>

    SELECT (count(?uri) as ?count) WHERE {
      ?uri a erediensten:BestuurVanDeEredienst;
          skos:prefLabel ?label.
      ${unitQuery}
      ${filterQuery}
    }
  `;

  const totalCount = await executeCountQuery({
    endpoint,
    query: countQuery,
    abortSignal,
  });

  if (totalCount === 0) {
    return { totalCount, results: [] };
  }

  const queryResult = await executeQuery<BindingObject<WorshipService>>({
    endpoint,
    query,
    abortSignal,
  });

  const results: WorshipService[] = queryResult.results.bindings.map(
    (binding) => ({
      uri: binding.uri.value,
      label: binding.label.value,
    }),
  );

  return {
    results,
    totalCount,
  };
}
