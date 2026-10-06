import { SearchSort } from '@lblod/ember-rdfa-editor-lblod-plugins/components/lmb-plugin/search-modal';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import { BESTUURSPERIODES } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  executeQuery,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import { AdministrativeUnit } from '../../worship-plugin';

export type FetchMandateesArgs = {
  endpoint: string;
  searchString: string;
  administrativeUnit?: AdministrativeUnit;
  page: number;
  pageSize: number;
  sort: SearchSort;
  period: (typeof BESTUURSPERIODES)[keyof typeof BESTUURSPERIODES];
  abortSignal?: AbortSignal;
};

export async function countElectees({
  endpoint,
  searchString,
  administrativeUnit,
  period,
  abortSignal,
}: Pick<
  FetchMandateesArgs,
  'searchString' | 'endpoint' | 'period' | 'administrativeUnit' | 'abortSignal'
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
        ?person a person:Person.

        ?bestuursorgaanIT lmb:heeftBestuursperiode ${sparqlEscapeUri(period)}.
        ${
          administrativeUnit
            ? `?bestuursorgaanIT mandaat:isTijdspecialisatieVan/besluit:bestuurt ${sparqlEscapeUri(administrativeUnit.uri)}.`
            : ''
        }

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
        
        
        ${
          searchString.length
            ? `
            ?person 
              foaf:familyName ?lastName;
              persoon:gebruikteVoornaam ?firstName.
            BIND(CONCAT(?firstName, " ", ?lastName) AS ?name)
            FILTER(contains(lcase(?name), lcase(${sparqlEscapeString(searchString)}) )).`
            : ''
        }
        
      }
      `;
  const response = await executeQuery({
    query,
    endpoint,
    abortSignal,
  });
  return Number(response.results.bindings[0].count.value);
}

export async function fetchElectees({
  endpoint,
  page,
  pageSize,
  searchString,
  administrativeUnit,
  sort,
  period,
  abortSignal,
}: FetchMandateesArgs) {
  const count = await countElectees({
    endpoint,
    searchString,
    period,
    administrativeUnit,
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

        ?bestuursorgaanIT lmb:heeftBestuursperiode <${period}>.
        ${
          administrativeUnit
            ? `?bestuursorgaanIT mandaat:isTijdspecialisatieVan/besluit:bestuurt ${sparqlEscapeUri(administrativeUnit.uri)}.`
            : ''
        }
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

        ${
          searchString.length
            ? `
          BIND(CONCAT(?firstName, " ", ?lastName) AS ?name)
          FILTER(contains(lcase(?name), lcase(${sparqlEscapeString(searchString)}) )).`
            : ''
        }
      }
      ORDER BY ${sortString}
      LIMIT ${pageSize} OFFSET ${page * pageSize}
    `;
  const response = await executeQuery({
    query,
    endpoint,
    abortSignal,
  });
  const electees = response.results.bindings.map(Electee.fromBinding);
  return { electees, count };
}

type FetchAdministrativeUnitsArgs = {
  endpoint: string;
  searchString?: string;
  lmbPeriod?: (typeof BESTUURSPERIODES)[keyof typeof BESTUURSPERIODES];
  classificationCodes?: string[];
  limit?: number;
  abortSignal?: AbortSignal;
};

/**
 * Function which fetches an alphabetically ordered series of administrative units (the top-level ones, not the tijdspecialisatie ones)
 * Additionally allows to filter by period, to only return administrative units which have a tijdsspecialisatie in the given period.
 */
export async function fetchAdministrativeUnits({
  endpoint,
  searchString,
  lmbPeriod,
  classificationCodes,
  limit,
  abortSignal,
}: FetchAdministrativeUnitsArgs) {
  const query = /* sparql */ `
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
  PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>

  SELECT DISTINCT ?uri ?label WHERE {
    ?uri 
      a besluit:Bestuurseenheid;
      skos:prefLabel ?bestuurseenheidLabel;
      besluit:classificatie ?classificatie.
    
    ?classificatie skos:prefLabel ?classificatieLabel.
    BIND(CONCAT(?classificatieLabel, " ", ?bestuurseenheidLabel) AS ?label)

    ${
      classificationCodes?.length
        ? `
        VALUES ?classificatie {
          ${classificationCodes.map(sparqlEscapeUri).join(`\n`)}
        }
      `
        : ''
    }
    ${
      lmbPeriod
        ? `
          ?bestuursorgaanIT mandaat:isTijdspecialisatieVan/besluit:bestuurt ?uri.
          ?bestuursorgaanIT lmb:heeftBestuursperiode <${lmbPeriod}>.
          `
        : ''
    }
    ${searchString?.length ? `FILTER(contains(lcase(?label), lcase(${sparqlEscapeString(searchString)}) )).` : ''}
  }
  ORDER BY ?label
  ${limit ? `LIMIT ${limit}` : ''}
  `;
  const response = await executeQuery({
    query,
    endpoint,
    abortSignal,
  });
  const administrativeUnits = response.results.bindings.map<AdministrativeUnit>(
    (binding) => ({
      uri: binding.uri.value,
      label: binding.label.value,
    }),
  );
  return administrativeUnits;
}
