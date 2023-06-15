import {
  executeCountQuery,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';

type Filter = { name?: string };

const buildCountQuery = ({ name }: Filter) => {
  return `
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

      SELECT (COUNT(?snippetDocument) AS ?count)
      WHERE {
          ?snippetList a ext:SnippetList ;
              ext:hasSnippet/pav:hasCurrentVersion ?snippetDocument .
          ?snippetDocument dct:title ?title ;
              ext:editorDocumentContent ?content ;
              pav:createdOn ?createdOn .
          ${name ? `FILTER (CONTAINS(LCASE(?title), "${name}"))` : ''}
      }
      `;
};

const buildFetchQuery = ({ name }: Filter) => {
  return `
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

      SELECT DISTINCT ?title ?content ?createdOn
      WHERE {
          ?snippetList a ext:SnippetList ;
              ext:hasSnippet/pav:hasCurrentVersion ?snippetDocument .
          ?snippetDocument dct:title ?title ;
              ext:editorDocumentContent ?content ;
              pav:createdOn ?createdOn .
          ${name ? `FILTER (CONTAINS(LCASE(?title), "${name}"))` : ''}
      }
      ORDER BY DESC(?createdOn) OFFSET 0 LIMIT 20
      `;
};

export const fetchFragments = async ({
  endpoint,
  abortSignal,
  filter,
}: {
  endpoint: string;
  abortSignal: AbortSignal;
  filter: Filter;
}) => {
  const totalCount = await executeCountQuery({
    endpoint,
    query: buildCountQuery(filter),
    abortSignal,
  });

  if (totalCount === 0) {
    return { totalCount, results: [] };
  }

  const queryResult = await executeQuery<{
    title: string;
    createdOn: string;
    content: string;
  }>({
    endpoint,
    query: buildFetchQuery(filter),
    abortSignal,
  });

  return { totalCount, results: queryResult.results.bindings };
};
