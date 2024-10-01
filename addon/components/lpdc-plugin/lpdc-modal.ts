import Component from '@glimmer/component';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import {
  fetchLpdcs,
  LPDC,
  type LpdcPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lpdc-plugin';
import { trackedReset } from 'tracked-toolbox';

interface Signature {
  Args: {
    config: LpdcPluginConfig;
    onLpdcInsert: (lpdc: LPDC) => void;
    closeModal: () => void;
    open: boolean;
  };
}

export default class LpdcPluginModalComponent extends Component<Signature> {
  // Filtering
  @tracked searchText: string | null = null;

  // Display
  @tracked error: unknown;

  /**
   * Paginating the search results
   */
  @trackedReset('searchText')
  pageNumber = 0;

  get config() {
    return this.args.config;
  }

  @action
  closeModal() {
    this.args.closeModal();
  }

  lpdcSearch = restartableTask(async () => {
    await timeout(100);
    this.error = null;
    const abortController = new AbortController();
    try {
      const results = await fetchLpdcs({
        filter: {
          name: this.searchText ?? undefined,
        },
        pageNumber: this.pageNumber,
        config: this.args.config,
      });

      return Object.assign(results.lpdc, {
        meta: results.meta,
      });
    } catch (error) {
      this.error = error;
      return [];
    } finally {
      //Abort all requests now that this task has either successfully finished or has been cancelled
      abortController.abort();
    }
  });

  lpdcResource = trackedTask(this, this.lpdcSearch, () => [
    this.searchText,
    this.pageNumber,
  ]);

  @action onSearchTextChange(event: InputEvent): void {
    this.searchText = (event.target as HTMLInputElement).value;
  }
}
