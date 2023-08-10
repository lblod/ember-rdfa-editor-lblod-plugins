import { action } from '@ember/object';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { ProseParser, SayController, Slice } from '@lblod/ember-rdfa-editor';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Args {
  controller: SayController;
  config: SnippetPluginConfig;
}

export default class SnippetInsertComponent extends Component<Args> {
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
  onInsert(content: string) {
    const domParser = new DOMParser();
    const parsed = domParser.parseFromString(content, 'text/html').body;
    const documentDiv = parsed.querySelector('div[data-say-document="true"]');

    this.closeModal();

    if (documentDiv) {
      return this.controller.withTransaction((tr) =>
        tr.replaceSelection(this.createSliceFromElement(documentDiv)),
      );
    }

    this.controller.withTransaction((tr) =>
      tr.replaceSelection(this.createSliceFromElement(parsed)),
    );
  }
}
