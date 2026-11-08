import {
  type BindingObject,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import type { BesluitTargetGroup } from './types';

const QUERY = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT distinct * WHERE {
      ?uri 
        skos:inScheme <http://lblod.data.gift/id/conceptscheme/0f9c9346-bd6d-4677-9ffa-5b5089b60934>; 
        skos:prefLabel ?label;
        skos:definition ?definition.
    }
  `;

const HARDCODED_TARGET_GROUPS: BesluitTargetGroup[] = [
  {
    uri: 'http://lblod.data.gift/id/concept/9aa8c940-4a25-4571-8063-9412494a10a7',
    label: 'Burger',
    definition:
      'Een natuurlijke persoon die als individu gebruikmaakt van publieke dienstverlening, in een persoonlijke of niet-professionele hoedanigheid.',
  },
  {
    uri: 'http://lblod.data.gift/id/concept/d2b67dac-6a8c-4314-990e-8fa87a12edfc',
    label: 'Lokaal Bestuur',
    definition: 'Overheidsentiteiten binnen het lokaal bestuursniveau.',
  },
  {
    uri: 'http://lblod.data.gift/id/concept/2242298b-7f1b-4bc2-b685-5771522987b7',
    label: 'Onderneming',
    definition: 'Entiteiten die economische activiteiten uitoefenen.',
  },
  {
    uri: 'http://lblod.data.gift/id/concept/44a75e92-3733-4d1d-8737-ca81cc608678',
    label: 'Vereniging',
    definition:
      'Juridische of organisatorische entiteiten die onder een van volgende categorieën vallen: verenigingen zonder winstoogmerk, internationale verenigingen zonder winstoogmerk, stichtingen, feitelijke verenigingen en afdelingen van koepelorganisaties.',
  },
];

export type BesluitTargetGroupQueryConfig = {
  endpoint: string;
  abortSignal?: AbortSignal;
};

export async function fetchBesluitTargetGroups({
  config,
}: {
  config: BesluitTargetGroupQueryConfig;
}): Promise<BesluitTargetGroup[]> {
  // TODO: remove the hardcoded codelist once the codelist is available on centrale vindplaats
  return HARDCODED_TARGET_GROUPS;
  const targetGroups = await executeQuery<BindingObject<BesluitTargetGroup>>({
    query: QUERY,
    ...config,
  }).then((queryResult) =>
    queryResult.results.bindings.map<BesluitTargetGroup>((binding) => ({
      uri: binding.uri.value,
      label: binding.label.value,
      definition: binding.definition.value,
    })),
  );

  return targetGroups;
}
