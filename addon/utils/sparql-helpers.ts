import * as RDF from '@rdfjs/types';
import { optionMapOr } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export type QueryResult<Binding = Record<string, RDF.Term>> = {
  results: {
    bindings: Binding[];
  };
};

type QueryConfig = {
  query: string;
  endpoint: string;
  abortSignal?: AbortSignal;
};

export async function executeQuery<Binding = Record<string, RDF.Term>>({
  query,
  endpoint,
  abortSignal,
}: { query: string } & QueryConfig) {
  const encodedQuery = encodeURIComponent(query.trim());

  const response = await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `query=${encodedQuery}`,
    signal: abortSignal,
  });

  if (response.ok) {
    return response.json() as Promise<QueryResult<Binding>>;
  } else {
    throw new Error(
      `Request to ${endpoint} was unsuccessful: [${response.status}] ${response.statusText}`
    );
  }
}

export async function executeCountQuery(queryConfig: QueryConfig) {
  const response = await executeQuery<{ count: { value: string } }>(
    queryConfig
  );

  return optionMapOr(0, parseInt, response.results.bindings[0]?.count.value);
}
