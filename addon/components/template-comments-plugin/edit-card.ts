import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor/addon';
import { TextSelection } from '@lblod/ember-rdfa-editor';
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

  /* Move the template comment before the node left of this */
  @action
  moveUp() {
    const comment = this.templateComment;
    if (!comment) return;
    const { node: node, pos: pos } = comment;
    const resolvedPos = this.controller.mainEditorState.doc.resolve(pos);
    const nodeBefore = resolvedPos.nodeBefore;
    if (!nodeBefore) return;
    const amountToMove = -nodeBefore.nodeSize;
    const initialCursorPos =
      this.controller.mainEditorState.selection.$head.pos;
    const newPos = pos + amountToMove;
    const newCursorPos = initialCursorPos + amountToMove;
    this.controller.withTransaction((tr) => {
      tr.delete(pos, pos + node.nodeSize);
      tr.insert(newPos, node);
      const mappedSelection = TextSelection.create(
        tr.doc,
        newCursorPos,
        newCursorPos,
      );
      tr.setSelection(mappedSelection);
      this.controller.focus();
      return tr;
    });
  }

  /* Move the template comment after the node right of this */
  @action
  moveDown() {
    const comment = this.templateComment;
    if (!comment) return;

    const { node: commentNode, pos: startPos } = comment;
    const posAfterComment = startPos + commentNode.nodeSize;
    const resolvedPos =
      this.controller.mainEditorState.doc.resolve(posAfterComment);
    const nodeAfterComment = resolvedPos.nodeAfter;
    if (!nodeAfterComment) return;

    const amountToMove = commentNode.nodeSize + nodeAfterComment.nodeSize;

    const newPos = startPos + amountToMove;
    const initialCursorPos =
      this.controller.mainEditorState.selection.$head.pos;
    const newCursorPos = initialCursorPos + amountToMove;

    this.controller.withTransaction((tr) => {
      tr.insert(newPos, commentNode);
      // do delete after setting the selection,
      //so the selection position can be easily constructed
      const mappedSelection = TextSelection.create(
        tr.doc,
        newCursorPos,
        newCursorPos,
      );
      tr.setSelection(mappedSelection);
      tr.delete(startPos, startPos + commentNode.nodeSize);

      this.controller.focus();
      return tr;
    });
  }
}
