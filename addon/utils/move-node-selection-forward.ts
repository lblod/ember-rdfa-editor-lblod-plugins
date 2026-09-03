import {
  Selection,
  type PNode,
  NodeSelection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';

export function moveNodeSelectionForward(selection: Selection, doc: PNode) {
  if (!(selection instanceof NodeSelection)) {
    return selection;
  }

  const $from = selection.$from;

  const index = $from.index();
  const parent = $from.parent;

  if (index + 1 < parent.childCount) {
    const nextPos = selection.from + selection.node.nodeSize;

    return NodeSelection.create(doc, nextPos);
  } else {
    const posAfter = selection.to;

    return TextSelection.create(doc, posAfter);
  }
}
