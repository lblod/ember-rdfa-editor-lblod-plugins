import { sparqlEscapeString } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { POTENTIALLY_ZONAL_URI } from './constants';

function buildFilters({
  zonality,
  type,
  codes,
  category,
  template,
}: {
  zonality?: string;
  type?: string;
  codes?: string[];
  category?: string;
  template?: { value: string };
}) {
  const filters = [];
  if (zonality) {
    filters.push(
      `FILTER(?zonality IN (<${zonality}>, <${POTENTIALLY_ZONAL_URI}>))`,
    );
  }
  if (type) {
    filters.push(`FILTER(?signType = <${type}>)`);
  }
  if (codes) {
    filters.push(`
        ${codes
          .map(
            (uri) => `
              <${uri}> mobiliteit:heeftMaatregelconcept ?uri.
            `,
          )
          .join(' ')}
    `);
  }
  if (category) {
    filters.push(`FILTER(?signClassification = <${category}>)`);
  }

  if (template) {
    filters.push(
      `
      FILTER(BOUND(?basicTemplate))
      FILTER(CONTAINS(STR(?basicTemplate), ${sparqlEscapeString(template.value)}))`,
    );
  }
  return filters;
}

export function generateMeasuresQuery({
  zonality,
  type,
  codes,
  category,
  pageStart = 0,
  count = false,
  template,
}: {
  zonality?: string;
  type?: string;
  codes?: string[];
  category?: string;
  pageStart?: number;
  count?: boolean;
  template?: { value: string };
}) {
  const filters = buildFilters({
    zonality,
    type,
    codes,
    category,
    template,
  });
  let pagination = '';
  if (!count) {
    pagination = `LIMIT 10 OFFSET ${pageStart}`;
  }
  const query = `
SELECT ${
    count
      ? '(COUNT(DISTINCT(?template)) AS ?count)'
      : '?uri ?label ?basicTemplate ?annotatedTemplate ?zonality ?temporal'
  }
WHERE {
    ?uri a mobiliteit:Mobiliteitmaatregelconcept;
         skos:prefLabel ?label;
         ext:zonality ?zonality;
         mobiliteit:template ?template.
         ?template ext:annotated ?annotatedTemplate;
                   prov:value ?basicTemplate.
    ?signUri a  ?signType;
                mobiliteit:heeftMaatregelconcept ?uri;
                skos:prefLabel ?signCode.

    ${filters.join('\n')}
  OPTIONAL {
    ?uri mobiliteit:variabeleSignalisatie ?temporal.
  }
  OPTIONAL {
              ?signUri  dct:type ?signClassification.
  }
}
${
  count
    ? ''
    : `GROUP BY ?uri ?label ?template ?zonality\n ORDER BY ASC(strlen(str(?label))) ASC(?label)`
}
${pagination}
`;
  return query;
}
