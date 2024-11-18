import { SearchSort } from '@lblod/ember-rdfa-editor-lblod-plugins/components/lmb-plugin/search-modal';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import { BESTUURSPERIODES } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  executeQuery,
  sparqlEscapeString,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';

export type FetchMandateesArgs = {
  endpoint: string;
  searchString: string;
  adminUnitSearch: string;
  page: number;
  pageSize: number;
  sort: SearchSort;
  period: (typeof BESTUURSPERIODES)[keyof typeof BESTUURSPERIODES];
};

export async function countElectees({
  endpoint,
  searchString,
  adminUnitSearch,
  period,
}: Pick<
  FetchMandateesArgs,
  'searchString' | 'endpoint' | 'period' | 'adminUnitSearch'
>) {
  const query = /* sparql */ `
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
      PREFIX person: <http://www.w3.org/ns/person#>
      PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT (COUNT(DISTINCT ?person) as ?count) WHERE {
        ?person a person:Person;
                foaf:familyName ?lastName;
                persoon:gebruikteVoornaam ?firstName.

        ?bestuursorgaanIT lmb:heeftBestuursperiode <${period}>;
                          mandaat:isTijdspecialisatieVan/besluit:bestuurt/skos:prefLabel ?adminUnitName.
        {
          ?verkiezing mandaat:steltSamen ?bestuursorgaanIT.
          ?kandidatenlijst mandaat:behoortTot ?verkiezing.

          ?verkiezingsresultaat mandaat:isResultaatVoor ?kandidatenlijst.
          ?verkiezingsresultaat mandaat:isResultaatVan ?person.
        }
        UNION
        {
          ?mandatee a mandaat:Mandataris;
                    org:holds ?mandaat;
                    mandaat:isBestuurlijkeAliasVan ?person.
          ?bestuursorgaanIT org:hasPost ?mandaat.
        }

        ${adminUnitSearch.length ? `FILTER(contains(lcase(?adminUnitName), lcase(${sparqlEscapeString(adminUnitSearch)}) )).` : ''}
        ${searchString.length ? `FILTER(contains(lcase(concat(?firstName, " ", ?lastName)), lcase(${sparqlEscapeString(searchString)}) )).` : ''}
      }
      `;
  const response = await executeQuery({
    query,
    endpoint,
  });
  return Number(response.results.bindings[0].count.value);
}

export async function fetchElectees({
  endpoint,
  page,
  pageSize,
  searchString,
  adminUnitSearch,
  sort,
  period,
}: FetchMandateesArgs) {
  const count = await countElectees({
    endpoint,
    searchString,
    period,
    adminUnitSearch,
  });
  let sortString = '?lastName ?firstName';
  if (sort) {
    const [key, direction] = sort;
    switch (key) {
      case 'fullName':
        sortString = `${direction}(?lastName) ?firstName`;
        break;
      case 'kandidatenlijst':
        sortString = `${direction}(?kandidatenlijstLabel) ?lastName ?firstName`;
        break;
      default:
        break;
    }
  }

  /**
   * This query fetches two types of people:
   * - People who have participated in the elections (and may or may not have a mandatee)
   * - People who have a mandatee
   *   (here we filter out the ones who participated in the elections as we don't want to get duplicates)
   */
  const query = /* sparql */ `
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
      PREFIX person: <http://www.w3.org/ns/person#>
      PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?person ?firstName ?lastName ?kandidatenlijstLabel WHERE {
        ?person a person:Person;
                  foaf:familyName ?lastName;
                  persoon:gebruikteVoornaam ?firstName.


        ?bestuursorgaanIT lmb:heeftBestuursperiode <${period}>;
                          mandaat:isTijdspecialisatieVan/besluit:bestuurt/skos:prefLabel ?adminUnitName.
        {
          ?verkiezing mandaat:steltSamen ?bestuursorgaanIT.
          ?kandidatenlijst mandaat:behoortTot ?verkiezing.
          ?kandidatenlijst skos:prefLabel ?kandidatenlijstLabel.

          ?verkiezingsresultaat mandaat:isResultaatVoor ?kandidatenlijst.
          ?verkiezingsresultaat mandaat:isResultaatVan ?person.
        }
        UNION
        {
          ?mandatee a mandaat:Mandataris;
                    org:holds ?mandaat;
                    mandaat:isBestuurlijkeAliasVan ?person.
          ?bestuursorgaanIT org:hasPost ?mandaat.

          FILTER NOT EXISTS {
            ?_bestuursorgaanIT lmb:heeftBestuursperiode <${period}>.
            ?verkiezing mandaat:steltSamen ?_bestuursorgaanIT.
            ?kandidatenlijst mandaat:behoortTot ?verkiezing.
            ?kandidatenlijst skos:prefLabel ?kandidatenlijstLabel.

            ?verkiezingsresultaat mandaat:isResultaatVoor ?kandidatenlijst.
            ?verkiezingsresultaat mandaat:isResultaatVan ?person.
          }
        }

        ${adminUnitSearch.length ? `FILTER(contains(lcase(?adminUnitName), lcase(${sparqlEscapeString(adminUnitSearch)}) )).` : ''}
        ${searchString.length ? `FILTER(contains(lcase(concat(?firstName, " ", ?lastName)), lcase(${sparqlEscapeString(searchString)}) )).` : ''}
      }
      ORDER BY ${sortString}
      LIMIT ${pageSize} OFFSET ${page * pageSize}
    `;
  const response = await executeQuery({
    query,
    endpoint,
  });
  const electees = response.results.bindings.map(Electee.fromBinding);
  return { electees, count };
}
