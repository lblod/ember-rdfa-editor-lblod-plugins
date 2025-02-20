import {
  keymap,
  EditorState,
  NodeSelection,
  ProseParser,
  SayController,
  SayView,
  Schema,
  Transaction,
  Selection,
} from '@lblod/ember-rdfa-editor';
import { undo, redo } from '@lblod/ember-rdfa-editor/plugins/history';
import { embeddedEditorBaseKeymap } from '@lblod/ember-rdfa-editor/core/keymap';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
export interface NestedProsemirrorArgs {
  target: HTMLElement;
  schema: Schema;
  outerView: SayView;
  getPos: () => number | undefined;
  controller: SayController;
  onFocus: (view: SayView) => void;
  onUpdateContent: (newContent: string, tr: Transaction) => void;
  initialContent: string;
}

export default class NestedProsemirror {
  view: SayView;
  outerView: SayView;
  getPos: () => number | undefined;
  controller: SayController;
  onFocus: (view: SayView) => void;
  onUpdateContent: (newContent: string, tr: Transaction) => void;
  initializing = false;
  constructor({
    target,
    schema,
    outerView,
    getPos,
    controller,
    onFocus,
    onUpdateContent,
    initialContent,
  }: NestedProsemirrorArgs) {
    const state = EditorState.create({ schema });
    const parser = ProseParser.fromSchema(schema);

    this.outerView = outerView;

    const historyKeymap = {
      'Mod-z': () =>
        undo(this.outerView.state, this.outerView.dispatch.bind(this)),
      'Mod-Z': () =>
        undo(this.outerView.state, this.outerView.dispatch.bind(this)),
      'Mod-y': () =>
        redo(this.outerView.state, this.outerView.dispatch.bind(this)),
      'Mod-Y': () =>
        redo(this.outerView.state, this.outerView.dispatch.bind(this)),
    };
    this.getPos = getPos;
    this.controller = controller;
    this.onFocus = onFocus;
    this.onUpdateContent = onUpdateContent;

    this.view = new SayView(
      { mount: target },
      {
        state,
        domParser: parser,
        dispatchTransaction: this.dispatch,
        plugins: [keymap({ ...embeddedEditorBaseKeymap, ...historyKeymap })],
        handleDOMEvents: {
          mousedown: () => {
            // Kludge to prevent issues due to the fact that the whole
            // footnote is node-selected (and thus DOM-selected) when
            // the parent editor is focused.

            if (this.outerView.hasFocus()) this.view?.focus();
          },
          focus: () => {
            const pos = this.getPos();
            if (pos !== undefined) {
              const outerSelectionTr = this.outerView.state.tr;
              const outerSelection = new NodeSelection(
                this.outerView.state.doc.resolve(pos),
              );
              outerSelectionTr.setSelection(outerSelection);
              outerSelectionTr.setMeta('addToHistory', false);
              this.outerView.dispatch(outerSelectionTr);
            }

            if (this.view) {
              this.controller.setActiveView(this.view);
              this.onFocus?.(this.view);
            }
          },
        },
      },
    );
    if (initialContent) {
      // avoid sending unnecessary transactions to the outer state when the
      // ember component renders (the outer state has just caused the node to
      // rerender, so it already knows its state)
      // this avoids spurious history entries
      this.initializing = true;
      // "shouldFocus: false" here is very important, it avoids an avalanche of
      // transactions every time a structure is rendered
      this.view.setHtmlContent(initialContent, { shouldFocus: false });
      this.initializing = false;
    }
  }

  dispatch = (tr: Transaction) => {
    if (this.view) {
      const newState = this.view.state.apply(tr);
      this.view.updateState(newState);
      if (!tr.getMeta('fromOutside') && !this.initializing) {
        this.onUpdateContent(this.view.htmlContent, tr);
      }
    }
  };
  setInnerHtmlContent(html: string) {
    const state = this.view.state;
    const tr = state.tr;
    tr.setMeta('fromOutside', true);

    const doc = htmlToDoc(html, {
      schema: state.schema,
      parser: this.view.domParser,
      editorView: this.view,
    });
    tr.replaceWith(0, tr.doc.nodeSize - 2, doc);
    tr.setSelection(Selection.atEnd(tr.doc));
    this.dispatch(tr);
  }
  get htmlContent() {
    return this.view.htmlContent;
  }
}
