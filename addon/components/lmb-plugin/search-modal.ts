import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';

import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import { IBindings } from 'fetch-sparql-endpoint';
type SearchSort = [keyof Mandatee, 'ASC' | 'DESC'] | false;

interface Args {
  config: LmbPluginConfig;
  open: boolean;
  closeModal: () => void;
  onInsert: () => void;
}

interface SparqlResponse {
  results: {
    bindings: IBindings[];
  };
}

export default class LmbPluginSearchModalComponent extends Component<Args> {
  // Display
  @tracked error: unknown;
  @tracked inputSearchText: string | null = null;
  @tracked sort: SearchSort = false;

  // Pagination
  @tracked pageNumber = 0;
  @tracked pageSize = 20;
  @tracked totalCount = 0;

  get config() {
    return this.args.config;
  }

  @action
  async closeModal() {
    await this.servicesResource.cancel();
    this.args.closeModal();
  }

  fetchData = restartableTask(async () => {
    const endpoint = this.args.config.endpoint;
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
              mandaat:isBestuurlijkeAliasVan ?person;
              org:hasMembership ?membership.
            ?person foaf:familyName ?lastName;
              persoon:gebruikteVoornaam ?firstName.
            ?status skos:prefLabel ?statusLabel.
            ?membership org:organisation ?fractie.
            ?fractie regorg:legalName ?fractieLabel.
            ?mandaat org:role ?role.
            ?role skos:prefLabel ?roleLabel.
            OPTIONAL  {
              ?mandatee mandaat:einde ?endDate
            }
            filter (!bound(?endDate) || ?endDate > now()).
        }        
        `,
      }),
    });
    const queryJson: SparqlResponse = await queryResponse.json();
    const mandatees = queryJson.results.bindings.map(Mandatee.fromBinding);
    return mandatees;
  });

  search = restartableTask(async () => {
    // Can't do what I want, so if the user modifies the filter before resolving the query will run again
    if (!this.fetchData.lastComplete) {
      await this.fetchData.perform();
    }

    if(!this.fetchData.lastComplete?.value) return;
    let mandatees: Mandatee[] = [...this.fetchData.lastComplete?.value]

    if (this.inputSearchText) {
      mandatees = mandatees?.filter((mandatee: Mandatee) =>
        mandatee.fullName.includes(this.inputSearchText as string),
      );
    }

    if (this.sort) {
      const [key, sortingDirection] = this.sort;
      mandatees = mandatees.sort((a: Mandatee, b: Mandatee) => {
        if (a[key] > b[key]) {
          return sortingDirection === 'ASC' ? 1 : -1;
        } else {
          return sortingDirection === 'ASC' ? -1 : 1;
        }
      });
    }

    const totalCount = mandatees?.length;

    mandatees = mandatees?.slice(
      this.pageSize * this.pageNumber,
      this.pageSize * (this.pageNumber + 1),
    );
    return {
      results: mandatees,
      totalCount,
    };
  });

  servicesResource = trackedTask(this, this.search, () => [
    this.inputSearchText,
    this.sort,
    this.pageNumber,
    this.pageSize,
  ]);

  @action
  setSort(sort: SearchSort) {
    this.sort = sort;
  }
  @action
  setInputSearchText(event: InputEvent) {
    assert(
      'inputSearchText must be bound to an input element',
      event.target instanceof HTMLInputElement,
    );

    this.inputSearchText = event.target.value;
    this.pageNumber = 0;
  }
  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }
}
