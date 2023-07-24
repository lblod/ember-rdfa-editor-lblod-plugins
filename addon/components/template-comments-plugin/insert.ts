import { findParentNode } from '@curvenote/prosemirror-utils';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { Command, SayController } from '@lblod/ember-rdfa-editor';

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
      if (dispatch) {
        const selection = this.controller.mainEditorState.selection;
        const parent = findParentNode((node) => {
          return (
            node.type !== this.controller.schema.nodes.text &&
            node.type !== this.controller.schema.nodes.placeholder
          );
        })(selection);
        if (parent) {
          dispatch(
            state.tr
              .replaceRangeWith(
                parent.start,
                parent.start,
                this.schema.nodes.templateComment.create(),
              )
              .scrollIntoView(),
          );
          this.controller.focus();
        }
      }
      return true;
    };
  }
}
