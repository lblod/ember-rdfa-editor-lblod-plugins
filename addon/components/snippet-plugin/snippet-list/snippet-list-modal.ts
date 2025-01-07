import Component from '@glimmer/component';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import {
  fetchSnippetLists,
  OrderBy,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';

import {
  SnippetPluginConfig,
  SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { localCopy, trackedReset } from 'tracked-toolbox';

interface Signature {
  Args: {
    config: SnippetPluginConfig;
    onSaveSnippetLists: (
      lists: SnippetList[],
      allowMultipleSnippets: boolean,
    ) => void;
    snippetListUris: string[] | undefined;
    closeModal: () => void;
    open: boolean;
    allowMultipleSnippets?: boolean;
  };
}

export default class SnippetListModalComponent extends Component<Signature> {
  // Filtering
  @tracked nameFilterText: string | null = null;

  // Sorting
  @tracked sort: OrderBy = null;

  // Display
  @tracked error: unknown;

  @trackedReset('args.snippetListUris')
  snippetListUris: string[] = [...(this.args.snippetListUris ?? [])];

  @localCopy('args.allowMultipleSnippets') allowMultipleSnippets = false;

  @action
  handleMultipleSnippetsCheckbox(checked: boolean) {
    this.allowMultipleSnippets = checked;
  }

  get config() {
    return this.args.config;
  }

  @action
  closeModal() {
    this.allowMultipleSnippets = this.args.allowMultipleSnippets ?? false;
    this.args.closeModal();
  }

  @action
  saveAndClose() {
    const snippetLists = this.snippetListResource.value?.filter((snippetList) =>
      this.snippetListUris.includes(snippetList.uri),
    );
    this.args.onSaveSnippetLists(
      snippetLists || [],
      this.allowMultipleSnippets,
    );
    this.args.closeModal();
    // Clear selection for next time
    this.snippetListUris = [];
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
  onChange(snippetListUris: string[]) {
    this.snippetListUris = snippetListUris;
  }
}
