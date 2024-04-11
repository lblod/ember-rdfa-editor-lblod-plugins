import {
  type BindingObject,
  executeQuery,
  sparqlEscapeString,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { AdministrativeUnit, WorshipPluginConfig } from '../';

export interface FetchAdministrativeUnitsArgs {
  config: WorshipPluginConfig;
  search: string;
  abortSignal?: AbortSignal;
}

const emptyUnit: AdministrativeUnit = {
  uri: '',
  label: '',
};
const selectUnit = Object.keys(emptyUnit)
  .map((key) => `?${key}`)
  .join(' ');

export async function fetchAdministrativeUnits({
  config: { endpoint },
  search,
  abortSignal,
}: FetchAdministrativeUnitsArgs): Promise<AdministrativeUnit[]> {
  const filterQuery = !search
    ? ''
    : `FILTER(CONTAINS(LCASE(?label), LCASE(${sparqlEscapeString(search)})))`;

  const query = `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX erediensten: <http://data.lblod.info/vocabularies/erediensten/>

    SELECT DISTINCT ${selectUnit} WHERE {
    ?uri erediensten:betrokkenBestuur ?targetUri;
      skos:prefLabel ?label.
    ${filterQuery}
    }
  `;

  const queryResult = await executeQuery<BindingObject<AdministrativeUnit>>({
    endpoint,
    query,
    abortSignal,
  });

  return queryResult.results.bindings.map<AdministrativeUnit>((binding) => ({
    uri: binding.uri.value,
    label: binding.label.value,
  }));
}
