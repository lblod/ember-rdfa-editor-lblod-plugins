import { NodeType, PNode, ResolvedPos } from '@lblod/ember-rdfa-editor';
// this might be better in ember-rdfa-editor as this works for any node and schema

/**
 * Find a position between nodes that passes a predicate test in document order.
 * Tries out all possible node spots to the right if the given position
 * in order of how nodes are displayed in the document.
 * returns the position of the first match of the predicate or null if none found.
 * @param mainDoc the main doc for which the position is returned
 * @param $startPos the starting ResolvedPos position to start the search from
 * @param predicate a predicate returning of the position is valid, receiving a parent and a local index. 
 *                  `parent.child(index)` is then the child after the index place.

 * @returns the global position (in reference to `mainDoc`)
 */
export function findNodePosDown(
  mainDoc: PNode,
  $startPos: ResolvedPos,
  predicate: (parent: Pnode, index: number) => boolean,
): number | null {
  let offset = 0;
  let offsetStartNode = null;
  let depth = $startPos.depth + 1;
  // loop over the depths.
  // if at a depth no match is found, should check all children of a depth higher
  // *after* the passed $startPos
  while (depth >= 0) {
    const $pos = mainDoc.resolve($startPos.after(depth));
    const parent = $pos.parent;
    let index = $pos.index();
    if (index === parent.childCount) {
      // should check if can place here, otherwise go depth higher?
      depth = depth - 1;
      continue;
    }

    // loop over the children *after* the given $startPos
    // and find a match in one of those children.
    // Note that checkContentMatchChildren returns offset starting from the
    // passed node, so an offset has to be kept for the final result.
    while (!offsetStartNode && index <= parent.childCount) {
      offsetStartNode = FindNodePosChildrenAsOffset(
        $startPos.parent,
        index,
        offset,
        predicate,
      );
      offset += $startPos.parent.child(index).nodeSize;
      index++;
    }
    if (offsetStartNode) return $pos.pos + offsetStartNode;
    depth = depth - 1;
  }
}

/**
 * Try to find a predicate match in children (and further down) of the passed parent
 * starting from startIndex.
 * returns the offset from the start of the search where a match is found
 * a global position can be found by adding the returned offset to the passed start position
 * Checks in order of the "document", from left to right.
 * @param parent the parent node to check the childs for
 * @param startIndex the first index to check in the given parent (0 to check all children)
 * @param currentOffset the current offset which is used by the recursion. An initial value can be passed but this does not change anything for the algorithm.
 * @param predicate the predicate to check for positions between nodes
 * @returns the offset (starting from the parent's startIndex) to the position that was found
 */
export function FindNodePosChildrenAsOffset(
  parent: PNode,
  startIndex: number,
  currentOffset: number,
  predicate: (parent: Pnode, index: number) => boolean,
): number {
  // check the current index
  const predicateValid = predicate(parent, startIndex);
  if (predicateValid) {
    if (currentOffset !== 0) {
      return currentOffset;
    }
  }

  let match: number | null = null;

  // when going inside childs, we are moving one place to the left in pos,
  // e.g. if parent starts at "1", the first child will start at "2",
  // which means an extra offset needed
  currentOffset++;

  // check the children of the node at the startIndex.
  // This is the node "after" the startIndex
  parent.child(startIndex).descendants((node, pos, parent, index) => {
    // if false is returned, descendants will stop looping.
    // if a match is found, we don't need to check anything anymore
    // this is an early return
    if (match) return false;

    //descendants' pos parameter is local
    // which is why an offset has to be kept.

    // going deeper in the tree is more
    // "to the left" in regards to the document
    // than the further children
    const childrenMatch = FindNodePosChildrenAsOffset(
      parent,
      index,
      currentOffset + pos,
      predicate,
    );
    if (childrenMatch && childrenMatch !== 0) {
      match = childrenMatch;
      return false;
    }
  });

  // if a match was found in the children, that's the spot we want
  if (match) return match;

  // if still no match, check behind the last child of the passed parent
  // index starts at 0 and exists till after the last child
  // this means index0 child1 index1 child2 index2
  // So childCount gives the possible index (=the last possible index)
  // if our current index is one less than childCount,
  // we are just before the last child.
  // startIndex + 1 is just after the last child
  const beforeLastChild = parent.childCount - 1;
  const afterLastChild = parent.childCount;
  if (startIndex === beforeLastChild) {
    const predicateValid = predicate(parent, afterLastChild);
    if (predicateValid) {
      const matchPlace = currentOffset + parent.child(startIndex).nodeSize;
      // position after the next child
      return matchPlace;
    }
    return;
  }
}

// Find the first match that the type of content can be inserted
// between nodes (so no node splitting)
// looks through the document down in "document" order
/**
 * Find the first match in document order, from left to right
 * where a node can be inserted without any problem, by using ContentMatching
 * This goes "down" when looking at the document.
 * @param mainDoc the document to search in.
 * @param $startPos The start position to start the search from
 * @param type the type to match for ContentMatching
 * @returns the global position (in reference to `mainDoc`) of the position between nodes that the given type can be inserted,
 */
export function findContentMatchPosRight(
  mainDoc: Pnode,
  $startPos: ResolvedPos,
  type: NodeType,
) {
  return findNodePosDown(mainDoc, $startPos, function (parent, index) {
    return !!parent.contentMatchAt(index).matchType(type);
  });
}
