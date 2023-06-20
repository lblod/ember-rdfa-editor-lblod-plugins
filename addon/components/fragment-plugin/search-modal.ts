import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import { fetchFragments } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/fragment-plugin/utils/fetch-data';
import { FragmentPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/fragment-plugin';

interface Args {
  config: FragmentPluginConfig;
  closeModal: () => void;
}

export default class FragmentPluginSearchModalComponent extends Component<Args> {
  // Filtering
  @tracked inputSearchText: string | null = null;

  // Display
  @tracked error: unknown;

  // Pagination
  @tracked pageNumber = 0;
  @tracked pageSize = 20;
  @tracked totalCount = 0;

  get config() {
    return this.args.config;
  }

  get searchText() {
    return this.inputSearchText;
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
    this.pageNumber,
    this.pageSize,
  ]);

  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }
}
