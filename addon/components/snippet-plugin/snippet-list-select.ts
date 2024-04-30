import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { UnorderedListIcon } from '@appuniversum/ember-appuniversum/components/icons/unordered-list';

import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Signature {
  Args: {
    config: SnippetPluginConfig;
    assignedSnippetListsIds: string[];
    onSaveSnippetListIds: (listIds: string[]) => void;
  };
}

export default class SnippetListSelectComponent extends Component<Signature> {
  UnorderedListIcon = UnorderedListIcon;
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
