import Component from '@glimmer/component';
import { action } from '@ember/object';
import { restartableTask, Task, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import {
  fetchSnippetLists,
  OrderBy,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';

import {
  SnippetPluginConfig,
  SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { trackedReset } from 'tracked-toolbox';

interface Args {
  config: SnippetPluginConfig;
  onSaveSnippetListIds: Task<Promise<void>, [snippetIds: string[]]>;
  assignedSnippetListsIds: string[];
  closeModal: () => void;
}

export default class SnippetListModalComponent extends Component<Args> {
  // Filtering
  @tracked nameFilterText: string | null = null;

  // Sorting
  @tracked sort: OrderBy = null;

  // Display
  @tracked error: unknown;

  @trackedReset('args.assignedSnippetListsIds')
  assignedSnippetListsIds: string[] = [...this.args.assignedSnippetListsIds];

  get config() {
    return this.args.config;
  }

  @action
  closeModal() {
    this.args.closeModal();
  }

  @action
  async saveAndClose() {
    await this.snippetListResource.cancel();

    await this.args.onSaveSnippetListIds.perform(this.assignedSnippetListsIds);
    this.args.closeModal();
  }

  snippetListSearch = restartableTask(async () => {
    await timeout(500);

    const abortController = new AbortController();

    try {
      const queryResult = await fetchSnippetLists({
        endpoint: this.args.config.endpoint,
        abortSignal: abortController.signal,
        filter: {
          name: this.nameFilterText ?? undefined,
        },
        orderBy: this.sort,
      });

      return queryResult.results;
    } catch (error) {
      this.error = error;
      return [];
    } finally {
      abortController.abort();
    }
  });

  snippetListResource = trackedTask<SnippetList[]>(
    this,
    this.snippetListSearch,
    () => [this.nameFilterText, this.sort],
  );

  @action
  onChange(assignedSnippetListsIds: string[]) {
    this.assignedSnippetListsIds = assignedSnippetListsIds;
  }
}
