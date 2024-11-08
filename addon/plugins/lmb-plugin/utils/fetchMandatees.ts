import { SearchSort } from '@lblod/ember-rdfa-editor-lblod-plugins/components/lmb-plugin/search-modal';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import { BESTUURSPERIODES } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  executeQuery,
  sparqlEscapeString,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';

export type FetchMandateesArgs = {
  endpoint: string;
  searchString: string;
  page: number;
  pageSize: number;
  sort: SearchSort;
  period: (typeof BESTUURSPERIODES)[keyof typeof BESTUURSPERIODES];
};

export async function countMandatees({
  endpoint,
  searchString,
  period,
}: Pick<FetchMandateesArgs, 'searchString' | 'endpoint' | 'period'>) {
  const query = `
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX regorg: <https://www.w3.org/ns/regorg#>
        PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>
      SELECT DISTINCT (count(distinct ?mandatee) as ?count) WHERE {
          ?mandatee a mandaat:Mandataris;
            org:holds ?mandaat;
            mandaat:status ?status;
            mandaat:isBestuurlijkeAliasVan ?person.
          ?person foaf:familyName ?lastName;
            persoon:gebruikteVoornaam ?firstName.
          ?status skos:prefLabel ?statusLabel.
          ?mandaat org:role ?role.
          ?role skos:prefLabel ?roleLabel.
            ?bestuursorgaanIT org:hasPost ?mandaat.
            ?bestuursorgaanIT lmb:heeftBestuursperiode <${period}>.

          ${searchString.length ? `FILTER(contains(lcase(concat(?firstName, " ", ?lastName)), lcase(${sparqlEscapeString(searchString)}) )).` : ''}
      }
      `;
  const response = await executeQuery({
    query,
    endpoint,
  });
  console.log(response);
  return Number(response.results.bindings[0].count.value);
}

export async function fetchMandatees({
  endpoint,
  page,
  pageSize,
  searchString,
  sort,
  period,
}: FetchMandateesArgs) {
  const count = await countMandatees({ endpoint, searchString, period });
  let sortString = '?lastName ?firstName';
  if (sort) {
    const [key, direction] = sort;
    switch (key) {
      case 'fullName':
        sortString = `${direction}(?lastName) ?firstName`;
        break;
      case 'status':
        sortString = `${direction}(?statusLabel) ?lastName ?firstName`;
        break;
      case 'fractie':
        sortString = `${direction}(?fractieLabel) ?lastName ?firstName`;
        break;
      case 'role':
        sortString = `${direction}(?roleLabel) ?lastName ?firstName`;
        break;

      default:
        break;
    }
  }

  const query = `
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX regorg: <https://www.w3.org/ns/regorg#>
        PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>
      SELECT DISTINCT ?mandatee ?person ?firstName ?lastName ?statusLabel ?fractieLabel ?roleLabel WHERE {
          {
            ?mandatee a mandaat:Mandataris;
              org:holds ?mandaat;
              mandaat:status ?status;
              mandaat:isBestuurlijkeAliasVan ?person.
            ?person foaf:familyName ?lastName;
              persoon:gebruikteVoornaam ?firstName.
            ?status skos:prefLabel ?statusLabel.
            ?mandaat org:role ?role.
            ?role skos:prefLabel ?roleLabel.
            ?bestuursorgaanIT org:hasPost ?mandaat.
            ?bestuursorgaanIT lmb:heeftBestuursperiode <${period}>.
          }
          OPTIONAL {
            ?mandatee org:hasMembership ?membership.
            ?membership org:organisation ?fractie.
            ?fractie regorg:legalName ?fractieLabel.
          }


          ${searchString.length ? `FILTER(contains(lcase(concat(?firstName, "", ?lastName)), lcase(${sparqlEscapeString(searchString)}) )).` : ''}
      }
        ORDER BY ${sortString}
        LIMIT ${pageSize} OFFSET ${page * pageSize}
      `;
  const response = await executeQuery({
    query,
    endpoint,
  });
  console.log(response.results.bindings);
  const mandatees = response.results.bindings.map(Mandatee.fromBinding);
  return { mandatees, count };
}
