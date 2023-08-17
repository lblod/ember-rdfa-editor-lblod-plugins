import { findNodePosDown } from '@lblod/ember-rdfa-editor/utils/position-utils';

/**
 * Find the first match in document order, from left to right
 * where a node can be inserted without any problem, by using ContentMatching
 * This goes "down" when looking at the document.
 * @param mainDoc the document to search in.
 * @param $startPos The start position to start the search from
 * @param type the type to match for ContentMatching
 * @predicatePos an _opional_ predicate to check together with the content match
 * @returns the global position (in reference to `mainDoc`) of the position between nodes that the given type can be inserted,
 */
export function findContentMatchPosRight(
  mainDoc: PNode,
  $startPos: ResolvedPos,
  type: NodeType,
  predicatePos: (pos: number) => boolean = () => true,
) {
  const findNode = findNodePosDown(
    mainDoc,
    $startPos,
    (parent: PNode, index: number) =>
      !!parent.contentMatchAt(index).matchType(type),
  );
  let foundPos = findNode.next().value;
  while (foundPos && !predicatePos(foundPos)) {
    foundPos = findNode.next().value;
  }
  return foundPos;
}
