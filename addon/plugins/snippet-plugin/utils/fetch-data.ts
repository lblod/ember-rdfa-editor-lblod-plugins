import {
  type BindingObject,
  executeCountQuery,
  executeQuery,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { Snippet, SnippetList, SnippetListArgs, type Tag } from '../index';
import type { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export type SnippetFilter = {
  name?: string;
  snippetListUris?: string[];
};
export type OrderBy =
  | 'label'
  | 'created-on'
  | '-label'
  | '-created-on'
  | ''
  | null;
export type Pagination = { pageNumber: number; pageSize: number };

const buildSnippetCountQuery = ({ name, snippetListUris }: SnippetFilter) => {
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
          ?snippetVersion dct:title ?title.
          OPTIONAL { ?snippetVersion schema:validThrough ?validThrough. }
          FILTER(!BOUND(?validThrough) || xsd:dateTime(?validThrough) > now())
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?title), ${sparqlEscapeString(name.toLowerCase())}))`
              : ''
          }
          ${
            snippetListUris && snippetListUris.length
              ? `FILTER (?snippetList IN (${snippetListUris
                  .map(sparqlEscapeUri)
                  .join(', ')}))`
              : ''
          }
      }
      `;
};

// const buildSnippetListCountQuery = ({ name }: SnippetFilter) => {
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
  filter: { name, snippetListUris },
  pagination: { pageSize, pageNumber },
}: {
  filter: SnippetFilter;
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
          ?snippetList pav:createdOn ?snippetListCreatedOn.
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
            snippetListUris && snippetListUris.length
              ? `FILTER (?snippetList IN (${snippetListUris
                  .map(sparqlEscapeUri)
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

type SnippetListFilter = {
  name?: string;
  tags?: Tag[];
};

const buildSnippetListFetchQuery = ({
  filter: { name, tags },
  orderBy,
}: {
  filter: SnippetListFilter;
  orderBy: OrderBy;
}) => {
  return /* sparql */ `
        PREFIX pav: <http://purl.org/pav/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX say: <https://say.data.gift/ns/>
        PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

        SELECT DISTINCT ?uri ?label ?createdOn ?importedResource ?tagUri ?tagLabel WHERE {
          ?uri a say:SnippetList;
            skos:prefLabel ?label;
            pav:createdOn ?createdOn.
          OPTIONAL { ?uri say:snippetImportedResource ?importedResource . }
          OPTIONAL {
            ?uri ext:hasTag ?tagUri .
            ?tagUri skos:prefLabel ?tagLabel .
          }
          ${
            tags && tags.length
              ? `
            FILTER EXISTS {
              ?uri ext:hasTag ?_tagUri .
              VALUES ?_tagUri { ${tags.map((tag) => sparqlEscapeUri(tag.uri)).join('\n')} }
            }
            `
              : ''
          }
          ${
            name
              ? `FILTER (CONTAINS(LCASE(?label), ${sparqlEscapeString(name.toLowerCase())}))`
              : ''
          }
        }
        ORDER BY ${buildOrderByString(orderBy)}
        `;
};

const buildSnippetListNameFetchQuery = (snippetListUris: string[]) => {
  return /* sparql */ `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX say: <https://say.data.gift/ns/>

        SELECT DISTINCT ?snippetList ?snippetListName WHERE {
          ?snippetList a say:SnippetList;
            skos:prefLabel ?snippetListName.
          FILTER (?snippetList IN (${snippetListUris
            .map(sparqlEscapeUri)
            .join(', ')}))
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
  filter: SnippetFilter;
  pagination: Pagination;
}) => {
  if (!filter.snippetListUris?.length) {
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

  const results = queryResult.results.bindings.map((binding) => {
    return new Snippet({
      title: binding.title?.value,
      createdOn: binding.createdOn?.value,
      content: binding.content?.value,
    });
  });

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
  filter: SnippetListFilter;
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
  const queryResult = await executeQuery({
    endpoint,
    query: buildSnippetListFetchQuery({ filter, orderBy }),
    abortSignal,
  });

  const results = [
    ...queryResult.results.bindings
      .map((binding) => ({
        uri: binding.uri?.value,
        label: binding.label?.value,
        createdOn: binding.createdOn?.value,
        importedResource: binding.importedResource?.value,
        tagUri: binding.tagUri?.value,
        tagLabel: binding.tagLabel?.value,
      }))
      .reduce((mappedResults, binding) => {
        const existing = mappedResults.get(binding.uri) ?? {
          ...binding,
          importedResources: [],
          tags: [],
        };
        if (binding.importedResource) {
          existing.importedResources = [
            ...existing.importedResources,
            binding.importedResource,
          ];
        }
        if (binding.tagUri) {
          existing.tags = [
            ...existing.tags,
            { uri: binding.tagUri, label: binding.tagLabel },
          ].sort((tagA, tagB) => tagA.label.localeCompare(tagB.label));
        }
        return mappedResults.set(binding.uri, existing);
      }, new Map<string, SnippetListArgs>())
      .values(),
  ].map((slArgs) => new SnippetList(slArgs));
  return { results };
};

export const fetchSnippetListNames = async ({
  endpoint,
  abortSignal,
  snippetListUris,
}: {
  endpoint: string;
  abortSignal: AbortSignal;
  snippetListUris: string[];
}) => {
  const queryResult = await executeQuery<
    BindingObject<{ snippetList: string; snippetListName: string }>
  >({
    endpoint,
    query: buildSnippetListNameFetchQuery(snippetListUris),
    abortSignal,
  });

  return new Map(
    queryResult.results.bindings.map((binding) => [
      binding.snippetList.value,
      binding.snippetListName.value,
    ]),
  );
};

const SNIPPET_LIST_TYPE = SAY('SnippetList').full;
export type UsedByTagResourceType = typeof SNIPPET_LIST_TYPE;

type TagFilter = {
  searchTerm?: Option<string>;
  usedByResourceTypes?: UsedByTagResourceType[];
};
const buildTagsQuery = ({ searchTerm, usedByResourceTypes }: TagFilter) => {
  return /* sparql */ `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX say: <https://say.data.gift/ns/>
    PREFIX gn: <http://data.lblod.info/vocabularies/gelinktnotuleren/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    SELECT DISTINCT ?uri ?label WHERE {
      ?uri a gn:Tag;
        skos:prefLabel ?label.
      ${
        usedByResourceTypes && usedByResourceTypes.length
          ? `
          FILTER EXISTS {
            ?usedBy a ?usedByType.
            VALUES ?usedByType {
              ${usedByResourceTypes.map((t) => sparqlEscapeUri(t)).join('\n')}
            }
            ?usedBy ext:hasTag ?uri.
          }
        `
          : ''
      } 
      ${searchTerm ? `FILTER(CONTAINS(?label, ${sparqlEscapeString(searchTerm)}))` : ''}
    }
    ORDER BY ?label
    `;
};

export const fetchTags = async ({
  endpoint,
  abortSignal,
  filter,
}: {
  endpoint: string;
  abortSignal?: AbortSignal;
  filter: TagFilter;
}): Promise<Tag[]> => {
  const queryResult = await executeQuery<
    BindingObject<{ uri: string; label: string }>
  >({
    endpoint,
    query: buildTagsQuery(filter),
    abortSignal,
  });

  return queryResult.results.bindings.map((binding) => ({
    uri: binding.uri.value,
    label: binding.label.value,
  }));
};
