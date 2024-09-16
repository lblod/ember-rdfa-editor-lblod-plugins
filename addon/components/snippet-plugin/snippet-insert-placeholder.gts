import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { type NodeType, type SayController } from '@lblod/ember-rdfa-editor';
import {
  type SnippetPluginConfig,
  type SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { createSnippetPlaceholder } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';
import SnippetListModal from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list/snippet-list-modal';

interface Signature {
  Args: {
    controller: SayController;
    config: SnippetPluginConfig;
  };
}
const empty: string[] = [];
export default class SnippetPluginSnippetInsertPlaceholder extends Component<Signature> {
  @tracked isModalOpen = false;

  get placeholderNode() {
    return this.args.controller.schema.nodes['snippet_placeholder'] as
      | NodeType
      | undefined;
  }

  @action openModal() {
    this.isModalOpen = true;
  }
  @action closeModal() {
    this.isModalOpen = false;
  }

  @action
  insertPlaceholder(lists: SnippetList[] | undefined) {
    if (lists) {
      const node = createSnippetPlaceholder(lists, this.args.controller.schema);

      this.args.controller.withTransaction(
        (tr) => {
          return tr.replaceSelectionWith(node);
        },
        { view: this.args.controller.mainEditorView },
      );
    }
  }

  <template>
    <li class='au-c-list__item'>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        @disabled={{(not this.placeholderNode)}}
        {{on 'click' this.openModal}}
      >
        {{t 'snippet-plugin.insert.placeholder'}}
      </AuButton>
    </li>
    <SnippetListModal
      @config={{@config}}
      @assignedSnippetListsIds={{empty}}
      @onSaveSnippetLists={{this.insertPlaceholder}}
      @open={{this.isModalOpen}}
      @closeModal={{this.closeModal}}
    />
  </template>
}
