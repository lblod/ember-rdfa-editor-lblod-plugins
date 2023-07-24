import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor/addon';
import { NodeSelection } from '@lblod/ember-rdfa-editor';

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

  get templateComment() {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.commentType
    ) {
      const comment = {
        node: selection.node,
        pos: selection.from,
      };
      return comment;
    } else {
      return;
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
