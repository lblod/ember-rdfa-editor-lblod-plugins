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
import NestedProsemirror from '@lblod/ember-rdfa-editor-lblod-plugins/utils/nested-prosemirror';

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
    this.innerEditor = new NestedProsemirror({
      target,
      schema: this.titleSchema,
      outerView: this.args.view,
      getPos: () => this.args.getPos(),
      controller: this.controller,
      onFocus: this.onInnerEditorFocus,
      onUpdateContent: this.onTitleUpdate,
      initialContent: this.titleContent,
    });
  }
  @action
  focusInner() {
    this.innerView?.focus();
  }
}
