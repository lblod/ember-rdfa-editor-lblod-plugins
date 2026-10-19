import {
  executeQuery,
  sparqlEscapeString,
  sparqlEscapeUri,
  type BindingObject,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import type { TaggableResourceType, TagWithUri } from './types';
import type { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

type TagFilter = {
  searchTerm?: Option<string>;
  taggableTypes?: TaggableResourceType[];
};
const buildTagsQuery = ({ searchTerm, taggableTypes }: TagFilter) => {
  return /* sparql */ `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX say: <https://say.data.gift/ns/>
    PREFIX gn: <http://data.lblod.info/vocabularies/gelinktnotuleren/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    SELECT DISTINCT ?uri ?value WHERE {
      ?uri a gn:Tag;
        skos:prefLabel ?value.
      ${
        taggableTypes && taggableTypes.length
          ? `
          FILTER EXISTS {
            ?usedBy a ?usedByType.
            VALUES ?usedByType {
              ${taggableTypes.map((t) => sparqlEscapeUri(t)).join('\n')}
            }
            ?usedBy ext:hasTag ?uri.
          }
        `
          : ''
      } 
      ${searchTerm ? `FILTER(CONTAINS(?value, ${sparqlEscapeString(searchTerm)}))` : ''}
    }
    ORDER BY ?value
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
}): Promise<TagWithUri[]> => {
  const queryResult = await executeQuery<
    BindingObject<{ uri: string; value: string }>
  >({
    endpoint,
    query: buildTagsQuery(filter),
    abortSignal,
  });

  return queryResult.results.bindings.map((binding) => ({
    uri: binding.uri.value,
    value: binding.value.value,
  }));
};
