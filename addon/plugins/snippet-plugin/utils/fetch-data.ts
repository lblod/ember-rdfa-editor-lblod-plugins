import {
  type BindingObject,
  executeCountQuery,
  executeQuery,
  sparqlEscapeString,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { Snippet, SnippetList, SnippetListArgs } from '../index';

type Filter = { name?: string; snippetListIds?: string[] };
export type OrderBy =
  | 'label'
  | 'created-on'
  | '-label'
  | '-created-on'
  | ''
  | null;
type Pagination = { pageNumber: number; pageSize: number };

const buildSnippetCountQuery = ({ name, snippetListIds }: Filter) => {
  return /* sparql */ `
      PREFIX schema: <http://schema.org/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX say: <https://say.data.gift/ns/>

      SELECT (COUNT(?snippet) AS ?count)
      WHERE {
          ?snippet a say:Snippet;
                   pav:hasCurrentVersion ?snippetVersion;
                   ^say:hasSnippet ?snippetList.
          ?snippetList mu:uuid ?snippetListId.
          ?snippetVersion dct:title ?title.
          OPTIONAL { ?snippetVersion schema:validThrough ?validThrough. }
          FILTER(!BOUND(?validThrough) || xsd:dateTime(?validThrough) > now())
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?title), ${sparqlEscapeString(name.toLowerCase())}))`
              : ''
          }
          ${
            snippetListIds && snippetListIds.length
              ? `FILTER (?snippetListId IN (${snippetListIds
                  .map((from) => sparqlEscapeString(from))
                  .join(', ')}))`
              : ''
          }
      }
      `;
};

// const buildSnippetListCountQuery = ({ name }: Filter) => {
//   return `
//       PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
//       SELECT (COUNT(?snippetLists) AS ?count)
//       WHERE {
//           ?snippetLists a ext:SnippetList;
//               skos:prefLabel ?label.
//           ${
//             name
//               ? `FILTER (CONTAINS(LCASE(?label), "${name.toLowerCase()}"))`
//               : ''
//           }
//       }
//       `;
// };

const buildSnippetFetchQuery = ({
  filter: { name, snippetListIds },
  pagination: { pageSize, pageNumber },
}: {
  filter: Filter;
  pagination: Pagination;
}) => {
  return /* sparql */ `
      PREFIX schema: <http://schema.org/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX say: <https://say.data.gift/ns/>

      SELECT DISTINCT ?title ?content ?createdOn
      WHERE {
          ?snippet a say:Snippet;
                   pav:hasCurrentVersion ?snippetVersion;
                   pav:createdOn ?createdOn;
                   ^say:hasSnippet ?snippetList.
          OPTIONAL {
            ?snippet schema:position ?position.
          }
          ?snippetList mu:uuid ?snippetListId;
                       pav:createdOn ?snippetListCreatedOn.
          ?snippetVersion dct:title ?title ;
                          ext:editorDocumentContent ?content.
          OPTIONAL { ?snippetVersion schema:validThrough ?validThrough. }
          FILTER(!BOUND(?validThrough) || xsd:dateTime(?validThrough) > now())
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?title), ${sparqlEscapeString(name.toLowerCase())}))`
              : ''
          }
          ${
            snippetListIds && snippetListIds.length
              ? `FILTER (?snippetListId IN (${snippetListIds
                  .map((from) => sparqlEscapeString(from))
                  .join(', ')}))`
              : ''
          }
      }
      ORDER BY DESC(?snippetListCreatedOn) ASC(?position) DESC(?createdOn) LIMIT ${pageSize} OFFSET ${
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
  return /* sparql */ `
        PREFIX pav: <http://purl.org/pav/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX say: <https://say.data.gift/ns/>

        SELECT (?snippetLists as ?id) ?label ?createdOn ?importedResources WHERE {
          ?snippetLists a say:SnippetList;
            skos:prefLabel ?label;
            pav:createdOn ?createdOn.
          OPTIONAL { ?snippetLists say:snippetImportedResource ?importedResources . }
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?label), ${sparqlEscapeString(name.toLowerCase())}))`
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
  if (!filter.snippetListIds?.length) {
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
  // We don't currently use this count, so skip the query, but we'll need it if we make pagination
  // work for the snippet list selector
  // const totalCount = await executeCountQuery({
  //   endpoint,
  //   query: buildSnippetListCountQuery(filter),
  //   abortSignal,
  // });

  // if (totalCount === 0) {
  //   return { totalCount, results: [] };
  // }

  const queryResult = await executeQuery<BindingObject<SnippetListArgs>>({
    endpoint,
    query: buildSnippetListFetchQuery({ filter, orderBy }),
    abortSignal,
  });

  const results = [
    ...queryResult.results.bindings
      .map((binding) => ({
        id: binding.id?.value,
        label: binding.label?.value,
        createdOn: binding.createdOn?.value,
        importedResources: binding.importedResources?.value,
      }))
      .reduce((mappedResults, bindings) => {
        const existing = mappedResults.get(bindings.id) ?? {
          ...bindings,
          importedResources: [],
        };
        if (bindings.importedResources) {
          existing.importedResources = [
            ...existing.importedResources,
            bindings.importedResources,
          ];
        }
        return mappedResults.set(bindings.id, existing);
      }, new Map<string, SnippetListArgs>())
      .values(),
  ].map((slArgs) => new SnippetList(slArgs));

  return { results };
};
