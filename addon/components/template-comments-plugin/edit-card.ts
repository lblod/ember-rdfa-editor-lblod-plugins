import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor/addon';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';

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
    return findParentNodeOfType(this.commentType)(selection);
  }

  get isInsideComment() {
    return !!this.templateComment;
  }

  @action
  remove() {
    const comment = this.templateComment;
    if (!comment) return;
    const { node: node, pos: pos } = comment;
    this.controller.withTransaction((tr) => {
      tr.replace(pos, pos + node.nodeSize);
      return tr;
    });
  }
}
