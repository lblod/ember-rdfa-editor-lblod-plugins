import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeType, Selection } from '@lblod/ember-rdfa-editor';

export function findAncestorOfType(selection: Selection, ...types: NodeType[]) {
  const parent = findParentNodeOfType(types)(selection);
  if (parent) {
    return parent;
  }
  if (types.includes(selection.$from.doc.type)) {
    return {
      node: selection.$from.doc,
      pos: -1,
      depth: 0,
    };
  }
  return;
}
