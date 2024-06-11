import { PNode, ResolvedPos } from '@lblod/ember-rdfa-editor';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
export function findInsertionPosInNode(
  $searchPos: ResolvedPos,
  $ancestorPos: ResolvedPos,
  nodeToInsert: PNode,
): Option<number> {
  const ancestor = $ancestorPos.nodeAfter;

  const insertionIndex = $searchPos.indexAfter($ancestorPos.depth);
  const insertionPos = $searchPos.posAtIndex(
    insertionIndex,
    $ancestorPos.depth,
  );
  if (
    !ancestor?.canReplaceWith(insertionIndex, insertionIndex, nodeToInsert.type)
  ) {
    return null;
  }
  return insertionPos;
}
