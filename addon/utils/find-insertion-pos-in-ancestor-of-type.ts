import { NodeType, PNode, Selection } from '@lblod/ember-rdfa-editor';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';

/**
 * Starting from the given selection, find a suitable position within an ancestor node
 * of a given type to insert a given node into. Returns null when this fails, aka when
 * suitable ancestor is found, or when within the found ancestor no suitable position can be found
 * @param selection
 * @param ancestorType
 * @param nodeToInsert
 */
export function findInsertionPosInAncestorOfType(
  selection: Selection,
  ancestorType: NodeType,
  nodeToInsert: PNode,
): Option<number> {
  const { $from } = selection;
  const ancestor = findParentNodeOfType(ancestorType)(selection);
  if (!ancestor) {
    return null;
  }
  const insertionIndex = $from.indexAfter(ancestor.depth);
  const insertionPos = $from.posAtIndex(insertionIndex, ancestor.depth);
  if (
    !ancestor.node.canReplaceWith(
      insertionIndex,
      insertionIndex,
      nodeToInsert.type,
    )
  ) {
    return null;
  }
  return insertionPos;
}
