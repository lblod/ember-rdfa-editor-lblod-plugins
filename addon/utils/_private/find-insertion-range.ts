import { findParentNodeClosestToPos } from '@curvenote/prosemirror-utils';
import { NodeType, PNode, ResolvedPos, Schema } from '@lblod/ember-rdfa-editor';
import { containsOnlyPlaceholder } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';

type Return = {
  from: number;
  to: number;
  containerNode: PNode;
};
export function findInsertionRange(args: {
  doc: PNode;
  $from: ResolvedPos;
  nodeType: NodeType;
  schema: Schema;
  limitTo?: string;
}): Return | null {
  const { doc, $from, nodeType, schema, limitTo } = args;
  for (let currentDepth = $from.depth; currentDepth >= 0; currentDepth--) {
    const currentAncestor = $from.node(currentDepth);
    const index = $from.index(currentDepth);
    if (currentAncestor.canReplaceWith(index, index, nodeType)) {
      if (containsOnlyPlaceholder(schema, currentAncestor)) {
        return {
          from: $from.start(currentDepth),
          to: $from.end(currentDepth),
          containerNode: currentAncestor,
        };
      } else {
        const insertPos = $from.after(currentDepth + 1);
        return {
          from: insertPos,
          to: insertPos,
          containerNode: currentAncestor,
        };
      }
    }
  }
  const limitContainer = limitTo
    ? findParentNodeClosestToPos(
        $from,
        (node) => node.type === schema.nodes[limitTo],
      )
    : null;

  const limitContainerRange = limitContainer
    ? {
        from: limitContainer.pos,
        to: limitContainer.pos + limitContainer.node.nodeSize,
      }
    : { from: 0, to: doc.nodeSize };
  const filterFunction = ({ from, to }: { from: number; to: number }) => {
    if (from >= limitContainerRange.from && to <= limitContainerRange.to) {
      const node = doc.nodeAt(from);
      if (node) {
        if (node.canReplaceWith(node.childCount, node.childCount, nodeType)) {
          return true;
        }
      }
    }
    return false;
  };
  const nextContainerRange =
    findNodes({
      doc,
      start: $from.pos,
      visitParentUpwards: true,
      reverse: false,
      filter: filterFunction,
    }).next().value ??
    findNodes({
      doc,
      start: $from.pos,
      visitParentUpwards: true,
      reverse: true,
      filter: filterFunction,
    }).next().value;
  if (nextContainerRange) {
    const { from, to } = nextContainerRange;
    const containerNode = doc.nodeAt(from);
    if (containerNode) {
      if (containsOnlyPlaceholder(schema, containerNode)) {
        return { from: from + 1, to: to - 1, containerNode };
      } else {
        return { from: to - 1, to: to - 1, containerNode };
      }
    }
  }
  return null;
}
