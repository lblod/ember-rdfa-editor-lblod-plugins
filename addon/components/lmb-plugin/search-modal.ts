import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';

import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import { fetchMandatees } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin/utils/fetchMandatees';
type SearchSort = [keyof Mandatee, 'ASC' | 'DESC'] | false;

interface Args {
  config: LmbPluginConfig;
  open: boolean;
  closeModal: () => void;
  onInsert: (mandatee: Mandatee) => void;
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
    this.inputSearchText = null;
    this.sort = false;
    await this.servicesResource.cancel();
    this.args.closeModal();
  }

  fetchData = restartableTask(async () => {
    return fetchMandatees({ endpoint: this.args.config.endpoint });
  });

  // TODO Either make this a trackedFunction or do filtering on the query and correctly pass an
  // AbortController
  search = restartableTask(async () => {
    if (!this.args.open) {
      return {
        results: [],
        totalCount: 0,
      };
    }

    // Can't do what I want, so if the user modifies the filter before resolving the query will run again
    if (!this.fetchData.lastComplete) {
      try {
        await this.fetchData.perform();
      } catch (err) {
        console.error('Got an error fetching LMB data', err);
        this.error = err;
      }
    }

    if (!this.fetchData.lastComplete?.value) return;
    let mandatees: Mandatee[] = [...this.fetchData.lastComplete.value];

    if (this.inputSearchText) {
      mandatees = mandatees?.filter((mandatee: Mandatee) =>
        mandatee.fullName
          .toLowerCase()
          .includes(this.inputSearchText?.toLowerCase() as string),
      );
    }

    if (this.sort) {
      const [key, sortingDirection] = this.sort;
      mandatees = mandatees.sort((a: Mandatee, b: Mandatee) => {
        if (key === 'fullName') {
          if (a.lastName === b.lastName) {
            if (a.firstName > b.firstName) {
              return sortingDirection === 'ASC' ? 1 : -1;
            } else {
              return sortingDirection === 'ASC' ? -1 : 1;
            }
          } else {
            if (a.lastName > b.lastName) {
              return sortingDirection === 'ASC' ? 1 : -1;
            } else {
              return sortingDirection === 'ASC' ? -1 : 1;
            }
          }
        } else if (a[key] > b[key]) {
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
    this.args.open,
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
  @action
  onInsert(mandatee: Mandatee) {
    this.args.onInsert(mandatee);
    this.closeModal();
  }
}
