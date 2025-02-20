import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController, TextSelection } from '@lblod/ember-rdfa-editor';
import {
  findParentNodeOfType,
  hasParentNodeOfType,
} from '@curvenote/prosemirror-utils';
import {
  findContentMatchPosLeft,
  findContentMatchPosRight,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-contentmatch';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';

type Args = {
  controller: SayController;
};

export default class TemplateCommentsPluginEditCardComponent extends Component<Args> {
  BinIcon = BinIcon;
  ChevronDownIcon = ChevronDownIcon;
  ChevronUpIcon = ChevronUpIcon;

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
    const insertPos = findContentMatchPosLeft(
      this.controller.mainEditorState.doc,
      pos,
      this.commentType,
      ($pos) =>
        !hasParentNodeOfType(this.commentType)(new TextSelection($pos, $pos)),
    );
    if (insertPos === undefined) return;

    const amountToMove = -(pos - insertPos);
    const initialCursorPos =
      this.controller.mainEditorState.selection.$head.pos;
    const newCursorPos = initialCursorPos + amountToMove;
    this.controller.withTransaction((tr) => {
      tr.delete(pos, pos + node.nodeSize);
      tr.insert(insertPos, node);
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
    const searchStart = startPos + commentNode.nodeSize;
    const $afterPos = this.controller.mainEditorState.doc.resolve(searchStart);

    // lists in template comments can have any content, including template comments...
    // This means we have to avoid moving inside a template comment, as the contentMatch would be valid
    const posToInsert = findContentMatchPosRight(
      this.controller.mainEditorState.doc,
      $afterPos,
      commentNode.type,
      (pos) => {
        const $pos = this.controller.mainEditorState.doc.resolve(pos);
        return !hasParentNodeOfType(this.commentType)(
          new TextSelection($pos, $pos),
        );
      },
    );

    if (posToInsert === undefined) return;
    const amountToMove = posToInsert - startPos;

    const initialCursorPos =
      this.controller.mainEditorState.selection.$head.pos;
    const newCursorPos = initialCursorPos + amountToMove;

    this.controller.withTransaction((tr) => {
      tr.insert(posToInsert, commentNode);
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
