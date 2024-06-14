import {
  EditorState,
  NodeSelection,
  ProseParser,
  SayController,
  SayView,
  Schema,
  Transaction,
  Selection,
} from '@lblod/ember-rdfa-editor';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
export interface NestedProsemirrorArgs {
  target: HTMLElement;
  schema: Schema;
  outerView: SayView;
  getPos: () => number | undefined;
  controller: SayController;
  onFocus: (view: SayView) => void;
  onUpdateContent: (newContent: string) => void;
  initialContent: string;
}
export default class NestedProsemirror {
  view: SayView;
  outerView: SayView;
  getPos: () => number | undefined;
  controller: SayController;
  onFocus: (view: SayView) => void;
  onUpdateContent: (newContent: string) => void;
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
      this.view.setHtmlContent(initialContent);
    }
  }

  dispatch = (tr: Transaction) => {
    if (this.view) {
      const newState = this.view.state.apply(tr);
      this.view.updateState(newState);
      if (!tr.getMeta('fromOutside')) {
        this.onUpdateContent(this.view.htmlContent);
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
