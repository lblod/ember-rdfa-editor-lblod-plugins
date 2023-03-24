import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { Command, NodeType, PNode, Schema } from '@lblod/ember-rdfa-editor';
import { validateTransaction } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';

interface CommandArgs {
  ancestorType: NodeType | ((schema: Schema) => NodeType);
  nodeToInsert: PNode | ((schema: Schema) => PNode);
  validateShapes?: Set<string>;
}

export default function insertNodeIntoAncestorAtPoint({
  ancestorType,
  nodeToInsert,
  validateShapes = new Set(),
}: CommandArgs): Command {
  return function (state, dispatch) {
    const { selection, schema } = state;
    const { $from } = selection;
    const ancestorTypeInst =
      typeof ancestorType === 'function' ? ancestorType(schema) : ancestorType;
    const insertionNode =
      typeof nodeToInsert === 'function' ? nodeToInsert(schema) : nodeToInsert;
    const ancestor = findParentNodeOfType(ancestorTypeInst)(selection);
    if (!ancestor) {
      return false;
    }
    const insertionIndex = $from.indexAfter(ancestor.depth);
    const insertionPos = $from.posAtIndex(insertionIndex, ancestor.depth);
    if (
      !ancestor.node.canReplaceWith(
        insertionIndex,
        insertionIndex,
        insertionNode.type
      )
    ) {
      console.log('cannot replace');
      return false;
    }
    const tr = state.tr;
    tr.replaceRangeWith(insertionPos, insertionPos, insertionNode);

    if (validateShapes?.size) {
      const report = validateTransaction(state, tr);
      if (
        report.results?.some((result) =>
          validateShapes.has(result.sourceShape.name)
        )
      ) {
        return false;
      }
    }
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  };
}
