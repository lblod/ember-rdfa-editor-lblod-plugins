import {
  executeCountQuery,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { Snippet } from '../index';

type Filter = { name?: string };
type Pagination = { pageNumber: number; pageSize: number };

const buildCountQuery = ({ name }: Filter) => {
  return `
      PREFIX schema: <http://schema.org/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

      SELECT (COUNT(?publishedSnippetVersion) AS ?count)
      WHERE {
          ?publishedSnippetContainer a ext:PublishedSnippetContainer ;
                             pav:hasCurrentVersion ?publishedSnippetVersion .
          ?publishedSnippetVersion dct:title ?title ;
               ext:editorDocumentContent ?content ;
               pav:createdOn ?createdOn .
          OPTIONAL { ?publishedSnippetVersion schema:validThrough ?validThrough. }
          FILTER(!BOUND(?validThrough) || xsd:dateTime(?validThrough) > now())
          ${name ? `FILTER (CONTAINS(LCASE(?title), "${name}"))` : ''}
      }
      `;
};

const buildFetchQuery = ({
  filter: { name },
  pagination: { pageSize, pageNumber },
}: {
  filter: Filter;
  pagination: Pagination;
}) => {
  return `
      PREFIX schema: <http://schema.org/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

      SELECT DISTINCT ?title ?content ?createdOn
      WHERE {
          ?publishedSnippetContainer a ext:PublishedSnippetContainer ;
                             pav:hasCurrentVersion ?publishedSnippetVersion .
          ?publishedSnippetVersion dct:title ?title ;
               ext:editorDocumentContent ?content ;
               pav:createdOn ?createdOn .
          ${name ? `FILTER (CONTAINS(LCASE(?title), "${name}"))` : ''}
          OPTIONAL { ?publishedSnippetVersion schema:validThrough ?validThrough. }
          FILTER(!BOUND(?validThrough) || xsd:dateTime(?validThrough) > now())
      }
      ORDER BY DESC(?createdOn) LIMIT ${pageSize} OFFSET ${
        pageNumber * pageSize
      }
      `;
};

export const fetchSnippets = async ({
  endpoint,
  abortSignal,
  filter,
  pagination,
}: {
  endpoint: string;
  abortSignal: AbortSignal;
  filter: Filter;
  pagination: Pagination;
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
    title: { value: string };
    createdOn: { value: string };
    content: { value: string };
  }>({
    endpoint,
    query: buildFetchQuery({ filter, pagination }),
    abortSignal,
  });

  const results = queryResult.results.bindings.map(
    (binding) =>
      new Snippet({
        title: binding.title?.value,
        createdOn: binding.createdOn?.value,
        content: binding.content?.value,
      }),
  );

  return { totalCount, results };
};
