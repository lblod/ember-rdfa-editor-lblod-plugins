/**
 *
 * Based on the footnotes example from https://github.com/ProseMirror/website
 *
 * Copyright (C) 2015-2017 by Marijn Haverbeke <marijnh@gmail.com> and others
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import {
  chainCommands,
  createParagraphNear,
  DOMSerializer,
  EditorState,
  keymap,
  liftEmptyBlock,
  newlineInCode,
  NodeSelection,
  RdfaEditorView,
  redo,
  Schema,
  Selection,
  splitBlock,
  StepMap,
  Transaction,
  undo,
} from '@lblod/ember-rdfa-editor';
import { date } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin/nodes';
import {
  isSome,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { insertHardBreak } from '@lblod/ember-rdfa-editor/commands/insert-hard-break';
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
import IntlService from 'ember-intl/services/intl';
import { customRdfaView, custom_rdfa } from '../plugins/custom-rdfa-plugin';
import { v4 as uuid } from 'uuid';

export default class NestedEditor extends Component<EmberNodeArgs> {
  @service declare intl: IntlService;
  innerView: RdfaEditorView | null = null;

  contentWrapper: Element | null = null;

  editorId = uuid();

  get outerView() {
    return this.args.view;
  }

  get node() {
    return this.args.node;
  }

  get pos() {
    return this.args.getPos();
  }

  get htmlContent() {
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.node.content,
      {
        document,
      }
    );
    const div = document.createElement('div');
    div.appendChild(fragment);
    return htmlSafe(div.innerHTML);
  }

  get schema() {
    return new Schema({
      nodes: {
        doc: {
          content: 'block+',
        },
        paragraph,
        date: date({
          placeholder: {
            insertDate: this.intl.t('date-plugin.insert.date'),
            insertDateTime: this.intl.t('date-plugin.insert.datetime'),
          },
        }),
        repaired_block,
        placeholder,

        text,

        hard_break,
        block_rdfa,
        invisible_rdfa,
        custom_rdfa,
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
  onFocus() {
    const outerSelectionTr = this.outerView.state.tr;
    const outerSelection = new NodeSelection(
      this.outerView.state.doc.resolve(this.pos)
    );
    outerSelectionTr.setSelection(outerSelection);
    this.outerView.dispatch(outerSelectionTr);
  }

  @action
  onClick() {
    // if (this.innerView && !this.innerView.hasFocus()) {
    //   this.innerView.focus();
    //   const tr = this.innerView.state.tr;
    //   const selection = Selection.atEnd(tr.doc);
    //   tr.setSelection(selection);
    //   this.innerView.dispatch(tr);
    // }
  }

  @action
  didInsertContentWrapper(target: Element) {
    this.contentWrapper = target;
    this.innerView = new RdfaEditorView(this.contentWrapper, {
      nodeViews: {
        custom_rdfa: customRdfaView(this.args.controller),
      },
      state: EditorState.create({
        doc: this.node,
        plugins: [
          keymap({
            'Mod-z': () =>
              undo(this.outerView.state, this.outerView.dispatch.bind(this)),
            'Mod-Z': () =>
              undo(this.outerView.state, this.outerView.dispatch.bind(this)),
            'Mod-y': () =>
              redo(this.outerView.state, this.outerView.dispatch.bind(this)),
            'Mod-Y': () =>
              redo(this.outerView.state, this.outerView.dispatch.bind(this)),
            'Mod-b': toggleMarkAddFirst(this.schema.marks.strong),
            'Mod-B': toggleMarkAddFirst(this.schema.marks.strong),
            'Mod-i': toggleMarkAddFirst(this.schema.marks.em),
            'Mod-I': toggleMarkAddFirst(this.schema.marks.em),
            'Mod-u': toggleMarkAddFirst(this.schema.marks.underline),
            'Mod-U': toggleMarkAddFirst(this.schema.marks.underline),
            Enter: chainCommands(
              newlineInCode,
              createParagraphNear,
              liftEmptyBlock,
              splitBlock,
              insertHardBreak
            ),
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
        focus: () => {
          const outerSelectionTr = this.outerView.state.tr;
          const outerSelection = new NodeSelection(
            this.outerView.state.doc.resolve(this.pos)
          );
          outerSelectionTr.setSelection(outerSelection);
          this.outerView.dispatch(outerSelectionTr);
          if (this.innerView) {
            this.args.controller.setEmbeddedView(this.innerView);
          }
        },
        focusout: () => {
          if (this.innerView) {
            const tr = this.innerView.state.tr;
            tr.setSelection(Selection.atEnd(this.innerView.state.doc));
            this.innerView.dispatch(tr);
          }
        },
      },
    });
  }

  @action
  onNodeUpdate() {
    if (this.innerView) {
      const state = this.innerView.state;
      const start = this.node.content.findDiffStart(state.doc.content);
      const end = this.node.content.findDiffEnd(state.doc.content);
      if (isSome(start) && isSome(end)) {
        let { a: endA, b: endB } = end;
        const overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        this.innerView.dispatch(
          state.tr
            .replace(start, endB, this.node.slice(start, endA))
            .setMeta('fromOutside', this.editorId)
        );
      }
    }
  }

  dispatchInner = (tr: Transaction) => {
    if (this.innerView) {
      const { state, transactions } = this.innerView.state.applyTransaction(tr);
      this.innerView.updateState(state);
      console.log('from outside');
      console.log(tr.getMeta('fromOutside'));
      if (tr.getMeta('fromOutside') !== this.editorId) {
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
