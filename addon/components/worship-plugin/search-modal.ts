import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import {
  fetchWorshipServices,
  WorshipPluginConfig,
  WorshipService,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin/stub';

interface Args {
  config: WorshipPluginConfig;
  open: boolean;
  closeModal: () => void;
  onInsert: (service: WorshipService) => void;
}

export default class WorshipPluginSearchModalComponent extends Component<Args> {
  // Filtering
  @tracked sort: string | false = false;
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
      event.target instanceof HTMLInputElement,
    );

    this.inputSearchText = event.target.value;
  }

  @action
  async closeModal() {
    await this.servicesResource.cancel();
    this.args.closeModal();
  }

  search = restartableTask(async () => {
    await timeout(500);

    const abortController = new AbortController();

    try {
      const queryResult = await fetchWorshipServices({
        config: this.args.config,
        abortSignal: abortController.signal,
        filter: {
          name: this.inputSearchText ?? undefined,
        },
        sort: this.sort,
        pagination: {
          page: this.pageNumber,
          pageSize: this.pageSize,
        },
      });

      return queryResult;
    } catch (error) {
      this.error = error;
      return [];
    } finally {
      abortController.abort();
    }
  });

  servicesResource = trackedTask(this, this.search, () => [
    this.inputSearchText,
    this.pageNumber,
    this.pageSize,
    this.sort,
  ]);

  @action
  setSort(sort: string | false) {
    this.sort = sort;
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
