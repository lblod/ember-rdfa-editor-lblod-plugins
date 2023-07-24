import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor/addon';

type Args = {
  controller: SayController;
};

export default class TemplateCommentsPluginEditCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get commentType() {
    return this.controller.schema.nodes.templateComment;
  }

  // A template comment is an atom node ("leaf node"). This means it can't be found
  // with node finders like `getParentOfType`. `.nodeAfter` will give the template comment as it is atom.
  get templateComment() {
    const currentSelection = this.controller.mainEditorState.selection;
    const maybeCommentNode = currentSelection.$from.nodeAfter;
    if (maybeCommentNode?.type === this.commentType) {
      return { node: maybeCommentNode, pos: currentSelection.$from.pos };
    } else {
      return null;
    }
  }

  get isInsideComment() {
    return !!this.templateComment;
  }

  @action
  remove() {
    const comment = this.templateComment;
    if (!comment) return;
    const { node: node, pos: pos } = comment;
    // when removing, we are inside an embedded editor, but want to remove
    // a node based on the main editor. Hence the view has to be specified.
    this.controller.withTransaction(
      (tr) => {
        tr.replace(pos, pos + node.nodeSize);
        return tr;
      },
      { view: this.controller.mainEditorView },
    );
  }
}
