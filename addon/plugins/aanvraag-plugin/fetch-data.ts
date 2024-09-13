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

type Filter = {
  title?: string | null;
  municipality?: string | null;
};
export type OrderBy =
  | 'label'
  | 'created-on'
  | '-label'
  | '-created-on'
  | ''
  | null;
type Pagination = { pageNumber: number; pageSize: number };

const buildAanvraagCountQuery = ({ title }: Filter) => {
  return `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX ex: <https://inventaris.onroerenderfgoed.be/>
      PREFIX dcterms: <http://purl.org/dc/terms/>

      SELECT (COUNT(?uri) AS ?count)
      WHERE {
          ?uri a ex:aanvraag ;
              ex:detailsAanduidingsobject ?objectUri ;
              ex:beschrijvingHandeling ?title .

          ?objectUri <https://inventaris.onroerenderfgoed.be/gemeente> ?gemeente ;
              foaf:name ?object ;
              dcterms:description ?description .
          ${
            title
              ? `FILTER (CONTAINS(LCASE(?title), ${sparqlEscapeString(title.toLowerCase())}))`
              : ''
          }
      }
      `;
};

const buildAanvraagFetchQuery = ({
  filter: { title },
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
      PREFIX dcterms: <http://purl.org/dc/terms/>

      SELECT DISTINCT ?uri ?title ?objectUri ?object ?gemeente ?description ?motivation
      WHERE {
          ?uri a ex:aanvraag ;
              ex:detailsAanduidingsobject ?objectUri ;
              ex:beschrijvingHandeling ?title ;
              ex:motivatie ?motivation .

          ?objectUri <https://inventaris.onroerenderfgoed.be/gemeente> ?gemeente ;
              foaf:name ?object ;
              dcterms:description ?description .
          ${
            title
              ? `FILTER (CONTAINS(LCASE(?title), "${title.toLowerCase()}"))`
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
  const count = await executeCountQuery({
    endpoint,
    query: buildAanvraagCountQuery(filter),
    abortSignal,
  });

  if (count === 0) {
    return { meta: { count }, data: [] };
  }

  const queryResult = await executeQuery<BindingObject<Aanvraag>>({
    endpoint,
    query: buildAanvraagFetchQuery({ filter, pagination }),
    abortSignal,
  });

  const results = queryResult.results.bindings.map((binding) => ({
    uri: binding.uri.value,
    title: binding.title?.value,
    objectUri: binding.objectUri?.value,
    object: binding.object?.value,
    gemeente: binding.gemeente?.value,
    description: binding.description?.value,
    motivation: binding.motivation?.value,
  }));

  return { meta: { count }, data: results };
};
