import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import {
  NodeSelection,
  type NodeType,
  type Selection,
} from '@lblod/ember-rdfa-editor';

/**
 * Find an ancestor of the current selection of one of the given nodetypes. Includes the selection
 * itself if it is a NodeSelection
 */
export function findAncestorOfType(selection: Selection, ...types: NodeType[]) {
  if (
    selection instanceof NodeSelection &&
    types.includes(selection.node.type)
  ) {
    return {
      node: selection.node,
      pos: selection.from,
      start: selection.from,
      depth: selection.$from.depth,
    };
  }
  const parent = findParentNodeOfType(types)(selection);
  if (parent) {
    return parent;
  }
  if (types.includes(selection.$from.doc.type)) {
    return {
      node: selection.$from.doc,
      pos: -1,
      start: 0,
      depth: 0,
    };
  }
  return;
}
