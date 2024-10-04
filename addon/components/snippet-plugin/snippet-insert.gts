import { action } from '@ember/object';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import {
  ProseParser,
  type SayController,
  Slice,
} from '@lblod/ember-rdfa-editor';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { type ImportedResourceMap } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import insertSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands/insert-snippet';
import SearchModal from './search-modal';

interface Sig {
  Args: {
    controller: SayController;
    config: SnippetPluginConfig;
    snippetListProperties:
      | { listIds: string[]; importedResources: ImportedResourceMap }
      | undefined;
    disabled?: boolean;
    allowMultipleSnippets?: boolean;
  };
}

export default class SnippetInsertComponent extends Component<Sig> {
  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  @action
  openModal() {
    this.controller.focus();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  createSliceFromElement(element: Element) {
    return new Slice(
      ProseParser.fromSchema(this.controller.schema).parse(element, {
        preserveWhitespace: true,
      }).content,
      0,
      0,
    );
  }

  @action
  onInsert(content: string, title: string) {
    this.closeModal();
    this.controller.doCommand(
      insertSnippet({
        content,
        title,
        assignedSnippetListsIds: this.args.snippetListProperties?.listIds || [],
        importedResources: this.args.snippetListProperties?.importedResources,
        allowMultipleSnippets: this.args.allowMultipleSnippets,
      }),
    );
  }

  get disabled() {
    return this.args.disabled ?? false;
  }

  <template>
    <li class='au-c-list__item'>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        @disabled={{this.disabled}}
        {{on 'click' this.openModal}}
      >
        {{t 'snippet-plugin.insert.title'}}
      </AuButton>
    </li>

    <SearchModal
      @open={{this.showModal}}
      @closeModal={{this.closeModal}}
      @config={{@config}}
      @onInsert={{this.onInsert}}
      @assignedSnippetListsIds={{@snippetListProperties.listIds}}
    />
  </template>
}
