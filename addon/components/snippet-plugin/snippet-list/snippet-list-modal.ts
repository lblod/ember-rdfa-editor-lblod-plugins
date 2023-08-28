import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, Task, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import { fetchSnippetLists } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';

import {
  SnippetPluginConfig,
  SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Args {
  config: SnippetPluginConfig;
  onSaveSnippetListIds: Task<Promise<void>, [snippetIds: string[]]>;
  assignedSnippetListsIds: string[];
  closeModal: () => void;
}

export default class SnippetListModalComponent extends Component<Args> {
  // Filtering
  @tracked inputSearchText: string | null = null;

  // Display
  @tracked error: unknown;

  @tracked assignedSnippetListsIds: string[] = [
    ...this.args.assignedSnippetListsIds,
  ];

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
          name: this.inputSearchText ?? undefined,
        },
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
    () => [this.inputSearchText],
  );

  @action
  onChange(assignedSnippetListsIds: string[]) {
    this.assignedSnippetListsIds = assignedSnippetListsIds;
  }
}
