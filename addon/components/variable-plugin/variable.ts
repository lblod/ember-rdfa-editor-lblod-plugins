import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  EditorState,
  EditorView,
  keymap,
  redo,
  Schema,
  StepMap,
  Transaction,
  undo,
} from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';
import {
  link,
  em,
  strong,
  underline,
  strikethrough,
} from '@lblod/ember-rdfa-editor/marks';
import {
  block_rdfa,
  hard_break,
  placeholder,
  text,
  paragraph,
  repaired_block,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  inline_rdfa,
  invisible_rdfa,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class Variable extends Component<EmberNodeArgs> {
  @tracked
  editing = false;

  innerView: EditorView | null = null;

  contentWrapper: Element | null = null;

  get outerView() {
    return this.args.view;
  }

  get node() {
    return this.args.node;
  }

  get pos() {
    return this.args.getPos();
  }

  get schema() {
    return new Schema({
      nodes: {
        doc: {
          content: 'block+',
        },
        paragraph,

        repaired_block,
        placeholder,

        text,

        hard_break,
        block_rdfa,
        invisible_rdfa,
      },
      marks: {
        inline_rdfa,
        link,
        em,
        strong,
        underline,
        strikethrough,
      },
    });
  }

  @action
  didInsertContentWrapper(target: Element) {
    this.contentWrapper = target;
  }

  @action
  enableEditing() {
    if (this.contentWrapper) {
      this.editing = true;
      this.innerView = new EditorView(this.contentWrapper, {
        state: EditorState.create({
          doc: this.node,
          plugins: [
            keymap({
              'Mod-z': () =>
                // eslint-disable-next-line @typescript-eslint/unbound-method
                undo(this.outerView.state, this.outerView.dispatch.bind(this)),
              'Mod-y': () =>
                // eslint-disable-next-line @typescript-eslint/unbound-method
                redo(this.outerView.state, this.outerView.dispatch.bind(this)),
              'Mod-b': toggleMarkAddFirst(this.schema.marks.strong),
              'Mod-B': toggleMarkAddFirst(this.schema.marks.strong),
              'Mod-i': toggleMarkAddFirst(this.schema.marks.em),
              'Mod-I': toggleMarkAddFirst(this.schema.marks.em),
              'Mod-u': toggleMarkAddFirst(this.schema.marks.underline),
              'Mod-U': toggleMarkAddFirst(this.schema.marks.underline),
            }),
          ],
          schema: this.schema,
        }),
        dispatchTransaction: this.dispatchInner,
        handleDOMEvents: {
          mousedown: () => {
            // Kludge to prevent issues due to the fact that the whole
            // footnote is node-selected (and thus DOM-selected) when
            // the parent editor is focused.
            if (this.outerView.hasFocus()) this.innerView?.focus();
          },
        },
      });
    }
    this.editing = true;
  }

  @action
  disableEditing() {
    this.innerView?.destroy();
    this.innerView = null;
    this.editing = false;
  }

  @action
  onNodeUpdate() {
    if (this.innerView) {
      const state = this.innerView.state;
      const start = this.node.content.findDiffStart(state.doc.content);
      const end = this.node.content.findDiffEnd(state.doc.content);
      if (start && end) {
        let { a: endA, b: endB } = end;
        const overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        this.innerView.dispatch(
          state.tr
            .replace(start, endB, this.node.slice(start, endA))
            .setMeta('fromOutside', true)
        );
      }
    }
  }

  dispatchInner = (tr: Transaction) => {
    if (this.innerView) {
      const { state, transactions } = this.innerView.state.applyTransaction(tr);
      this.innerView.updateState(state);

      if (!tr.getMeta('fromOutside')) {
        const outerTr = this.outerView.state.tr,
          offsetMap = StepMap.offset(this.pos + 1);
        for (let i = 0; i < transactions.length; i++) {
          const steps = transactions[i].steps;
          for (let j = 0; j < steps.length; j++)
            outerTr.step(unwrap(steps[j].map(offsetMap)));
        }
        if (outerTr.docChanged) this.outerView.dispatch(outerTr);
      }
    }
  };

  willDestroy(): void {
    super.willDestroy();
    this.innerView?.destroy();
    this.innerView = null;
  }
}
