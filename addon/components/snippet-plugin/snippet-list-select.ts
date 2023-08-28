import { action } from '@ember/object';
import { Task } from 'ember-concurrency';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Args {
  config: SnippetPluginConfig;
  assignedSnippetListsIds: string[];
  onSaveSnippetListIds: Task<Promise<void>, [snippetIds: string[]]>;
}

export default class SnippetListSelectComponent extends Component<Args> {
  @tracked showModal = false;

  @action
  openModal() {
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }
}
