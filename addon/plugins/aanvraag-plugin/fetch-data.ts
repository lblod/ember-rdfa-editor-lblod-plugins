import {
  BindingObject,
  executeCountQuery,
  executeQuery,
  sparqlEscapeString,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import {
  Aanvraag,
  AanvraagResults,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/aanvraag-plugin';

type Filter = { municipality?: string };
export type OrderBy =
  | 'label'
  | 'created-on'
  | '-label'
  | '-created-on'
  | ''
  | null;
type Pagination = { pageNumber: number; pageSize: number };

const buildAanvraagCountQuery = ({ municipality }: Filter) => {
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
            municipality
              ? `FILTER (CONTAINS(LCASE(?gemeente), "${municipality.toLowerCase()}"))`
              : ''
          }
      }
      `;
};

const buildAanvraagFetchQuery = ({
  filter: { municipality },
  pagination: { pageSize, pageNumber },
}: {
  filter: Filter;
  pagination: Pagination;
}) => {
  return `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ex: <https://inventaris.onroerenderfgoed.be/>

      SELECT DISTINCT ?uri ?title ?object
      WHERE {
          ?uri a ex:aanvraag ;
              ex:detailsAanduidingsobject ?objectUri ;
              ex:beschrijvingHandeling ?title .
          ?objectUri ex:gemeente ?gemeente;
              foaf:name ?object.
          ${
            municipality
              ? `FILTER (CONTAINS(LCASE(?gemeente), "${municipality.toLowerCase()}"))`
              : ''
          }
      }
      ORDER BY DESC(?title) LIMIT ${pageSize} OFFSET ${pageNumber * pageSize}
      `;
};

export const fetchAanvragen = async ({
  endpoint,
  abortSignal,
  filter,
  pagination,
}: {
  endpoint: string;
  abortSignal: AbortSignal;
  filter: Filter;
  pagination: Pagination;
}): Promise<AanvraagResults> => {
  // TODO re-enable count when the query is settled
  // const count = await executeCountQuery({
  //   endpoint,
  //   query: buildAanvraagCountQuery(filter),
  //   abortSignal,
  // });

  // if (count === 0) {
  //   return { meta: { count }, data: [] };
  // }

  const queryResult = await executeQuery<BindingObject<Aanvraag>>({
    endpoint,
    query: buildAanvraagFetchQuery({ filter, pagination }),
    abortSignal,
  });

  const results = queryResult.results.bindings.map((binding) => ({
    uri: binding.uri.value,
    title: binding.title?.value,
    object: binding.object?.value,
  }));

  return { meta: { count: 10 }, data: results };
};
