import { action } from '@ember/object';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import {
  ProseParser,
  SayController,
  Slice,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { createSnippet } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';
import { type ImportedResourceMap } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import SearchModal from './search-modal';

interface Sig {
  Args: {
    controller: SayController;
    config: SnippetPluginConfig;
    snippetListProperties:
      | { listIds: string[]; importedResources: ImportedResourceMap }
      | undefined;
    disabled?: boolean;
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
    const domParser = new DOMParser();
    const parsed = domParser.parseFromString(content, 'text/html').body;
    const documentDiv = parsed.querySelector('div[data-say-document="true"]');

    this.closeModal();
    const assignedSnippetListProperties = this.args.snippetListProperties;

    if (documentDiv && assignedSnippetListProperties) {
      return this.controller.withTransaction((tr: Transaction) =>
        tr.replaceSelectionWith(
          createSnippet({
            controller: this.controller,
            content,
            title,
            snippetListIds: assignedSnippetListProperties.listIds,
            importedResources: assignedSnippetListProperties.importedResources,
          }),
        ),
      );
    }
    this.controller.withTransaction((tr) =>
      tr.replaceSelection(this.createSliceFromElement(parsed)),
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
