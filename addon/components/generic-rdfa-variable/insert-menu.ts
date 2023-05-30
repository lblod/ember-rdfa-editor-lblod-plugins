import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { tracked } from 'tracked-built-ins';

import { DOMParser as ProseParser } from 'prosemirror-model';

import { basicSetup, EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { tooltips } from '@codemirror/view';

type Args = {
  controller: SayController;
};

export default class GenericRdfaVariableInsertMenu extends Component<Args> {
  @tracked modalOpen = false;
  private htmlEditor?: EditorView;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  @action
  showModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
    this.controller.focus();
  }

  @action
  onCancel() {
    this.closeModal();
  }

  @action
  setupHtmlEditor(element: HTMLElement) {
    this.htmlEditor = new EditorView({
      state: EditorState.create({
        extensions: [
          basicSetup,
          html(),
          tooltips({ position: 'absolute', parent: element }),
        ],
      }),
      parent: element,
    });
  }

  @action
  onInsert() {
    if (!this.htmlEditor) {
      return;
    }

    const editorContent = this.htmlEditor.state.sliceDoc();

    if (!editorContent) {
      return;
    }

    const domParser = new DOMParser();

    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        ProseParser.fromSchema(this.schema).parse(
          domParser.parseFromString(editorContent, 'text/html')
        )
      );
    });

    this.closeModal();
  }
}
