import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  SayController,
} from '@lblod/ember-rdfa-editor';

type Args = {
  controller: SayController;
};

export default class TableOfContentsCardComponent extends Component<Args> {
  get toggled() {
    return !!this.tableOfContentsRange;
  }

  get controller() {
    return this.args.controller;
  }

  get tableOfContentsRange() {
    let result: { from: number; to: number } | undefined;
    this.controller.mainEditorState.doc.descendants((node, pos) => {
      if (node.type === this.controller.schema.nodes['table_of_contents']) {
        result = { from: pos, to: pos + node.nodeSize };
      }
      return !result;
    });
    return result;
  }

  @action
  toggle() {
    if (this.tableOfContentsRange) {
      const { from, to } = this.tableOfContentsRange;
      this.controller.withTransaction(
        (tr) => {
          return tr.deleteRange(from, to);
        },
        { view: this.controller.mainEditorView }
      );
    } else {
      const { schema } = this.controller;
      const state = this.controller.activeEditorState;
      let replacePosition: number;
      state.doc.nodesBetween(
        0,
        state.doc.nodeSize - 2,
        (node, pos, parent, index) => {
          if (
            replacePosition === undefined &&
            state.doc.canReplaceWith(
              index,
              index,
              schema.nodes['table_of_contents']
            )
          ) {
            replacePosition = pos;
          } else if (
            replacePosition === undefined &&
            state.doc.canReplaceWith(
              index + 1,
              index + 1,
              schema.nodes['table_of_contents']
            )
          ) {
            replacePosition = pos + node.nodeSize;
          }
        }
      );
      if (replacePosition !== undefined) {
        this.controller.withTransaction(
          (transaction) => {
            return transaction.replaceWith(
              replacePosition,
              replacePosition,
              schema.node('table_of_contents')
            );
          },
          { view: this.controller.mainEditorView }
        );
      }
    }
  }
}
