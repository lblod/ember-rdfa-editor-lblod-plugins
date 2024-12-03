import { type PNode } from '@lblod/ember-rdfa-editor';

export function hasDecendant(
  nodeToDescendInto: PNode,
  matchFunc: (node: PNode) => boolean,
) {
  let foundMatch = false;
  nodeToDescendInto.descendants((node) => {
    // Already found a match, stop descending or checking
    if (foundMatch) return false;
    if (matchFunc(node)) {
      foundMatch = true;
      return false;
    }
    return true;
  });

  return foundMatch;
}
