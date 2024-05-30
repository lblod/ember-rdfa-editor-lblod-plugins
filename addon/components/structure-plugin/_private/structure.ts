import {
  EditorState,
  NodeSelection,
  ProseParser,
  SayController,
  SayView,
  Schema,
  SchemaSpec,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { PNode } from '@lblod/ember-rdfa-editor';
import Component from '@glimmer/component';
import { Args } from 'ember-modifier/-private/class/modifier';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import ProseMirrorEditor from '../../prosemirror-editor';
import { text } from '@lblod/ember-rdfa-editor/nodes';
import { action } from '@ember/object';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { tracked, cached } from '@glimmer/tracking';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { redacted } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/confidentiality-plugin';

export default class Structure extends Component<EmberNodeArgs> {
  ProseMirrorEditor = ProseMirrorEditor;

  titleSchema = new Schema({
    nodes: {
      text: {},
      doc: {
        content: 'text*',
        toDOM: () => {
          return ['span', 0];
        },
      },
    },
    marks: {
      strong,
      em,
      underline,
      strikethrough,
      subscript,
      superscript,
      highlight,
      color,
      redacted,
    },
  });
  @tracked titleContent = this.titleAttr;
  @tracked innerView?: SayView;
  innerEditor: NestedProsemirror | null = null;

  get showPlaceholder() {
    return this.args.node.nodeSize === 0;
  }
  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get isEmpty() {
    if (this.node.childCount > 1) {
      return false;
    }
    const firstChild = unwrap(this.node.firstChild);
    if (!firstChild.isTextblock) {
      return false;
    }
    if (firstChild.childCount > 0) {
      return false;
    }
    return true;
  }

  get tag() {
    return 'div';
  }
  get titleAttr() {
    return this.node.attrs.title;
  }

  @action
  onAttrsUpdate() {
    if (this.titleAttr !== this.innerEditor?.htmlContent) {
      this.innerEditor?.setHtmlContent(this.titleAttr);
    }
  }

  onTitleUpdate = (content: string) => {
    this.args.updateAttribute('title', content);
  };
  onInnerEditorFocus = (view: SayView) => {
    this.controller.setActiveView(view);
  };
  @action
  initializeNestedEditor(target: HTMLElement) {
    this.innerEditor = new NestedProsemirror(
      target,
      this.titleSchema,
      this.args.view,
      () => this.args.getPos(),
      this.controller,
      this.onInnerEditorFocus,
      this.onTitleUpdate,
      this.titleContent,
    );
  }
  @action
  focusInner() {
    this.innerView?.focus();
  }
}
class NestedProsemirror {
  view: SayView;
  outerView: SayView;
  getPos: () => number | undefined;
  controller: SayController;
  onFocus: (view: SayView) => void;
  onUpdateContent: (newContent: string) => void;
  constructor(
    target: HTMLElement,
    schema: Schema,
    outerView: SayView,
    getPos: () => number | undefined,
    controller: SayController,
    onFocus: (view: SayView) => void,
    onUpdateContent: (newContent: string) => void,
    initialContent: string,
  ) {
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
      this.onUpdateContent(this.view.htmlContent);
    }
  };
  setHtmlContent(html: string) {
    this.view.setHtmlContent(html);
  }
  get htmlContent() {
    return this.view.htmlContent;
  }
}
