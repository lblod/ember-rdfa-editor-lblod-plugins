import { action } from '@ember/object';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { ProseParser, SayController, Slice } from '@lblod/ember-rdfa-editor';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import insertSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands/insert-snippet';

interface Args {
  controller: SayController;
  config: SnippetPluginConfig;
  assignedSnippetListsIds: string[];
  disabled?: boolean;
}

export default class SnippetInsertComponent extends Component<Args> {
  AddIcon = AddIcon;

  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  get config() {
    return this.args.config;
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
        assignedSnippetListsIds: this.args.assignedSnippetListsIds,
      }),
    );
  }

  get disabled() {
    return this.args.disabled ?? false;
  }
}
