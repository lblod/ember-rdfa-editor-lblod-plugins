import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import { IBindings } from 'fetch-sparql-endpoint';

type SparqlResponse = {
  results: {
    bindings: IBindings[];
  };
};

type FetchMandateesArgs = {
  endpoint: string;
};

export async function fetchMandatees({ endpoint }: FetchMandateesArgs) {
  const queryResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX regorg: <https://www.w3.org/ns/regorg#>
      SELECT DISTINCT ?mandatee ?person ?firstName ?lastName ?statusLabel ?fractieLabel ?roleLabel WHERE {
          ?mandatee a mandaat:Mandataris;
            org:holds ?mandaat;
            mandaat:status ?status;
            mandaat:isBestuurlijkeAliasVan ?person.
          ?person foaf:familyName ?lastName;
            persoon:gebruikteVoornaam ?firstName.
          ?status skos:prefLabel ?statusLabel.
          ?mandaat org:role ?role.
          ?role skos:prefLabel ?roleLabel.
          OPTIONAL  {
            ?mandatee mandaat:einde ?endDate
          }
          OPTIONAL {
            ?mandatee org:hasMembership ?membership.
            ?membership org:organisation ?fractie.
            ?fractie regorg:legalName ?fractieLabel.
          }
          filter (!bound(?endDate) || ?endDate > now()).
      }
      `,
    }),
  });
  const queryJson: SparqlResponse = await queryResponse.json();
  const mandatees = queryJson.results.bindings.map(Mandatee.fromBinding);
  return mandatees;
}
