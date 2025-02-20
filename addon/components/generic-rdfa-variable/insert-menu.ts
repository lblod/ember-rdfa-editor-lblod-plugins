import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { tracked } from 'tracked-built-ins';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { EditorView, tooltips } from '@codemirror/view';
import { HtmlPlusIcon } from '@appuniversum/ember-appuniversum/components/icons/html-plus';

import { insertGenericRdfa } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/generic-rdfa-variable/commands/insert-generic-rdfa';

type Args = {
  controller: SayController;
};

export default class GenericRdfaVariableInsertMenu extends Component<Args> {
  HtmlPlusIcon = HtmlPlusIcon;

  @tracked modalOpen = false;
  private htmlEditor?: EditorView;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get canInsert() {
    if (this.controller.inEmbeddedView) {
      return false;
    }

    return this.controller.checkCommand(insertGenericRdfa(''));
  }

  @action
  showModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;

    // The recommended way to focus the editor is to call `this.controller.focus()` before opening the modal
    // e.g. in the `showModal` fn, then `focus-trap` inside modal will record it as the element that should
    // be focused when `focus-trap` is deactivated (modal is closed).
    //
    // However, for some reason, this doesn't work in this case. Maybe because `initialFocus` is false, maybe
    // because of something else, I wasn't able to get to the bottom of it.
    //
    // So, we're doing it the other way here: we wait for the modal to close, wait for the `focus-trap` to
    // deactivate, and then focus the editor.
    setTimeout(() => {
      this.controller.focus();
    }, 0);
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

    this.htmlEditor.focus();
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

    this.args.controller.doCommand(insertGenericRdfa(editorContent), {
      view: this.controller.mainEditorView,
    });

    this.closeModal();
  }
}
