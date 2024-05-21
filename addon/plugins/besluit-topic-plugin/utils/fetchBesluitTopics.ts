import {
  type BindingObject,
  executeCountQuery,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';

export type BesluitTopic = {
  uri: string;
  label: string;
};

type BesluitTopicsCollection = {
  totalCount: number;
  topics: BesluitTopic[];
};

const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT distinct * WHERE {
      ?uri skos:inScheme
      <https://data.vlaanderen.be/id/conceptscheme/BesluitThema>; skos:prefLabel ?label
    }
  `;

const countQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT (count(?uri) as ?count) WHERE {
      ?uri skos:inScheme
      <https://data.vlaanderen.be/id/conceptscheme/BesluitThema>; skos:prefLabel ?label
    }
  `;

export type BesluitTopicsQueryConfig = {
  endpoint: string;
  abortSignal?: AbortSignal;
};

export async function fetchBesluitTopics({
  config,
}: {
  config: BesluitTopicsQueryConfig;
}): Promise<BesluitTopicsCollection> {
  const totalCount = await executeCountQuery({
    query: countQuery,
    ...config,
  });

  const topics = await executeQuery<BindingObject<BesluitTopic>>({
    query,
    ...config,
  }).then((queryResult) =>
    queryResult.results.bindings.map<BesluitTopic>((binding) => ({
      uri: binding.uri.value,
      label: binding.label.value,
    })),
  );

  return {
    totalCount,
    topics,
  };
}
