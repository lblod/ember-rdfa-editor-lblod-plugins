import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import { fetchSnippets } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Args {
  config: SnippetPluginConfig;
  assignedSnippetListsIds: string[];
  closeModal: () => void;
  open: boolean;
  onInsert: (content: string, title: string) => void;
}

export default class SnippetPluginSearchModalComponent extends Component<Args> {
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
      event.target instanceof HTMLInputElement,
    );

    this.inputSearchText = event.target.value;
  }

  @action
  async closeModal() {
    await this.snippetsResource.cancel();
    this.args.closeModal();
  }

  snippetsSearch = restartableTask(async () => {
    await timeout(500);

    const abortController = new AbortController();

    try {
      const queryResult = await fetchSnippets({
        endpoint: this.args.config.endpoint,
        abortSignal: abortController.signal,
        filter: {
          name: this.inputSearchText ?? undefined,
          assignedSnippetListIds:
            this.args.assignedSnippetListsIds ?? undefined,
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

  snippetsResource = trackedTask(this, this.snippetsSearch, () => [
    this.inputSearchText,
    this.pageNumber,
    this.pageSize,
    this.args.assignedSnippetListsIds,
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
