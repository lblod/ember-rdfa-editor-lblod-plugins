import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import { fetchFragments } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/fragment-plugin/utils/fetch-data';
import { FragmentPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/fragment-plugin';

import PaginationComponent from '../pagination/pagination-component';

interface Args {
  config: FragmentPluginConfig;
  closeModal: () => void;
}

export default class FragmentPluginSearchModalComponent extends PaginationComponent<Args> {
  // Filtering
  @tracked inputSearchText: string | null = null;

  // Display
  @tracked error: unknown;

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.pageSize = 20;
  }

  @action
  setInputSearchText(event: InputEvent) {
    assert(
      'inputSearchText must be bound to an input element',
      event.target instanceof HTMLInputElement
    );

    this.inputSearchText = event.target.value;
  }

  @action
  async closeModal() {
    await this.fragmentsResource.cancel();
    this.args.closeModal();
  }

  fragmentSearch = restartableTask(async () => {
    await timeout(500);

    const abortController = new AbortController();

    try {
      const queryResult = await fetchFragments({
        endpoint: this.args.config.endpoint,
        abortSignal: abortController.signal,
        filter: {
          name: this.inputSearchText ?? undefined,
        },
        pagination: {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
        },
      });

      this.totalCount = queryResult.totalCount;

      return queryResult.results;
    } catch (error) {
      this.error = error;
      return [];
    } finally {
      abortController.abort();
    }
  });

  fragmentsResource = trackedTask(this, this.fragmentSearch, () => [
    this.inputSearchText,
  ]);
}
