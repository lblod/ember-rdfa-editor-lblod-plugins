import {
  executeCountQuery,
  executeQuery,
  sparqlEscapeString,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { Snippet, SnippetList } from '../index';

type Filter = { name?: string; assignedSnippetListIds?: string[] };
export type OrderBy =
  | 'label'
  | 'created-on'
  | '-label'
  | '-created-on'
  | ''
  | null;
type Pagination = { pageNumber: number; pageSize: number };

const buildSnippetCountQuery = ({ name, assignedSnippetListIds }: Filter) => {
  return `
      PREFIX schema: <http://schema.org/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

      SELECT (COUNT(?publishedSnippetVersion) AS ?count)
      WHERE {
          ?publishedSnippetContainer a ext:PublishedSnippetContainer ;
                             pav:hasCurrentVersion ?publishedSnippetVersion ;
                             ext:fromSnippetList ?fromSnippetList .
          ?fromSnippetList mu:uuid ?fromSnippetListId .
          ?publishedSnippetVersion dct:title ?title ;
               ext:editorDocumentContent ?content ;
               pav:createdOn ?createdOn .
          OPTIONAL { ?publishedSnippetVersion schema:validThrough ?validThrough. }
          FILTER(!BOUND(?validThrough) || xsd:dateTime(?validThrough) > now())
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?title), "${name.toLowerCase()}"))`
              : ''
          }
          ${
            assignedSnippetListIds && assignedSnippetListIds.length
              ? `FILTER (?fromSnippetListId IN (${assignedSnippetListIds
                  .map((from) => sparqlEscapeString(from))
                  .join(', ')}))`
              : ''
          }
      }
      `;
};

const buildSnippetListCountQuery = ({ name }: Filter) => {
  return `
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      SELECT (COUNT(?snippetLists) AS ?count)
      WHERE {
          ?snippetLists a ext:SnippetList;
              skos:prefLabel ?label.
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?label), "${name.toLowerCase()}"))`
              : ''
          }
      }
      `;
};

const buildSnippetFetchQuery = ({
  filter: { name, assignedSnippetListIds },
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
      PREFIX prov: <http://www.w3.org/ns/prov#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

      SELECT DISTINCT ?title ?content ?createdOn
      WHERE {
          ?publishedSnippetContainer a ext:PublishedSnippetContainer ;
                             pav:hasCurrentVersion ?publishedSnippetVersion ;
                             ext:fromSnippetList ?fromSnippetList .
          ?fromSnippetList mu:uuid ?fromSnippetListId .
          ?publishedSnippetVersion dct:title ?title ;
               ext:editorDocumentContent ?content ;
               pav:createdOn ?createdOn .
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?title), "${name.toLowerCase()}"))`
              : ''
          }
          ${
            assignedSnippetListIds && assignedSnippetListIds.length
              ? `FILTER (?fromSnippetListId IN (${assignedSnippetListIds
                  .map((from) => sparqlEscapeString(from))
                  .join(', ')}))`
              : ''
          }
          OPTIONAL { ?publishedSnippetVersion schema:validThrough ?validThrough. }
          FILTER(!BOUND(?validThrough) || xsd:dateTime(?validThrough) > now())
      }
      ORDER BY DESC(?createdOn) LIMIT ${pageSize} OFFSET ${
        pageNumber * pageSize
      }
      `;
};

// This can be more generic, but for now it's fine
const buildOrderByString = (orderBy: OrderBy) => {
  switch (orderBy) {
    case 'label':
      return 'ASC(LCASE(?label))';
    case '-label':
      return 'DESC(LCASE(?label))';
    case 'created-on':
      return 'ASC(?createdOn)';
    case '-created-on':
      return 'DESC(?createdOn)';
    default:
      return 'DESC(?createdOn)';
  }
};

const buildSnippetListFetchQuery = ({
  filter: { name },
  orderBy,
}: {
  filter: Filter;
  orderBy: OrderBy;
}) => {
  return `
        PREFIX pav: <http://purl.org/pav/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

        SELECT (?snippetLists as ?id) ?label ?createdOn WHERE {
          ?snippetLists a ext:SnippetList;
            skos:prefLabel ?label;
            pav:createdOn ?createdOn.
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?label), "${name.toLowerCase()}"))`
              : ''
          }
        }
        ORDER BY ${buildOrderByString(orderBy)}
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
  if (!filter.assignedSnippetListIds?.length) {
    return { totalCount: 0, results: [] };
  }

  const totalCount = await executeCountQuery({
    endpoint,
    query: buildSnippetCountQuery(filter),
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
    query: buildSnippetFetchQuery({ filter, pagination }),
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

export const fetchSnippetLists = async ({
  endpoint,
  abortSignal,
  filter,
  orderBy,
}: {
  endpoint: string;
  abortSignal: AbortSignal;
  filter: Filter;
  orderBy: OrderBy;
}) => {
  const totalCount = await executeCountQuery({
    endpoint,
    query: buildSnippetListCountQuery(filter),
    abortSignal,
  });

  if (totalCount === 0) {
    return { totalCount, results: [] };
  }

  const queryResult = await executeQuery<{
    id: { value: string };
    label: { value: string };
    createdOn: { value: string };
  }>({
    endpoint,
    query: buildSnippetListFetchQuery({ filter, orderBy }),
    abortSignal,
  });

  const results = queryResult.results.bindings.map(
    (binding) =>
      new SnippetList({
        id: binding.id?.value,
        label: binding.label?.value,
        createdOn: binding.createdOn?.value,
      }),
  );

  return { totalCount, results };
};
