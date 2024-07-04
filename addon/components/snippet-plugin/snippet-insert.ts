import { action } from '@ember/object';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
import {
  ProseParser,
  SayController,
  Slice,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { v4 as uuidv4 } from 'uuid';

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
    const domParser = new DOMParser();
    const parsed = domParser.parseFromString(content, 'text/html').body;
    const documentDiv = parsed.querySelector('div[data-say-document="true"]');

    this.closeModal();
    const parser = ProseParser.fromSchema(this.controller.schema);

    if (documentDiv) {
      return this.controller.withTransaction((tr: Transaction) => {
        return tr.replaceSelectionWith(
          this.controller.schema.node(
            'snippet',
            {
              assignedSnippetListsIds: this.args.assignedSnippetListsIds,
              title: title,
              subject: `http://data.lblod.info/snippets/${uuidv4()}`,
            },
            htmlToDoc(content, {
              schema: this.controller.schema,
              parser,
              editorView: this.controller.mainEditorView,
            }).content,
          ),
        );
      });
    }

    this.controller.withTransaction((tr) =>
      tr.replaceSelection(this.createSliceFromElement(parsed)),
    );
  }

  get disabled() {
    return this.args.disabled ?? false;
  }
}
