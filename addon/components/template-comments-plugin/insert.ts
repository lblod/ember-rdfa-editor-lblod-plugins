import { findParentNode, canInsert } from '@curvenote/prosemirror-utils';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { Command, SayController } from '@lblod/ember-rdfa-editor';
import { templateComment } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';

type Args = {
  controller: SayController;
};

export default class TemplateCommentsPluginInsertCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get canInsert() {
    return this.controller.checkCommand(this.insertCommand());
  }

  @action
  doInsert() {
    this.controller.doCommand(this.insertCommand());
  }

  /* insert before the first node in the selection
   * This avoids splitting up existing nodes and follows the logic
   * that a comment is desired before the place of the cursor
   */
  insertCommand(): Command {
    return (state, dispatch) => {
      if (!this.controller || this.controller.inEmbeddedView) return false;

      const selection = this.controller.mainEditorState.selection;
      const parent = findParentNode((node) => {
        return (
          node.type !== this.controller.schema.nodes.text &&
          node.type !== this.controller.schema.nodes.placeholder
        );
      })(selection);

      const newTemplateNode = this.schema.nodes.templateComment.createAndFill();
      if (!parent) {
        // if no parent, selection is somewhere at the top of doc, so insert at start of doc
        if (dispatch) {
          const transaction = state.tr
            .insert(0, newTemplateNode)
            .scrollIntoView();

          dispatch(transaction);
          this.controller.focus();
        }
        return true;
      }

      // get the parent of parent
      // check what content is allowed (contentMatchAt) by using the "index"
      // check if template comment is allowed as comment.
      // In principle this should be the same as `CanAppend`, but this seems to work better.
      const insertPos = parent.pos;
      const resolvedPos = state.doc.resolve(insertPos);
      const parentAboveInsertion = resolvedPos.parent;
      const indexInParent = resolvedPos.index();
      const allowedContent = parentAboveInsertion.contentMatchAt(indexInParent);
      const allowed = allowedContent.matchType(newTemplateNode.type);
      if (!allowed) return false;
      if (dispatch) {
        const transaction = state.tr
          .insert(insertPos, newTemplateNode)
          .scrollIntoView();

        dispatch(transaction);
        this.controller.focus();
      }
      return true;
    };
  }
}
