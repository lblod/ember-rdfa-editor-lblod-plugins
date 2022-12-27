import { Command, NodeType, PNode, Selection } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { ArticleStructurePluginOptions } from '..';
import { findAncestorOfType } from '../utils';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';
const moveSelectedStructure = (
  options: ArticleStructurePluginOptions,
  direction: 'up' | 'down'
): Command => {
  return (state, dispatch) => {
    const { doc, selection, schema } = state;
    const structureSpecs = options.map((type) => schema.nodes[type.name]);
    const currentStructure = findAncestorOfType(selection, ...structureSpecs);
    if (!currentStructure || currentStructure.pos === -1) {
      return false;
    }
    const insertionPosition = calculateInsertionPosition(
      doc,
      currentStructure.pos,
      currentStructure.node.type,
      direction
    );
    if (insertionPosition === null || insertionPosition === undefined) {
      return false;
    }
    const relativeSelectionOffset = selection.from - currentStructure.pos;
    const currentStructureSpec = unwrap(
      options.find((spec) => spec.name === currentStructure.node.type.name)
    );
    if (dispatch) {
      const transaction = state.tr;
      transaction.delete(
        currentStructure.pos,
        currentStructure.pos + currentStructure.node.nodeSize
      );
      const mappedInsertionPosition =
        transaction.mapping.map(insertionPosition);
      transaction.insert(mappedInsertionPosition, currentStructure.node);
      const newSelection = Selection.near(
        transaction.doc.resolve(
          mappedInsertionPosition + relativeSelectionOffset
        )
      );
      transaction.setSelection(newSelection);
      recalculateStructureNumbers(transaction, currentStructureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

export function calculateInsertionPosition(
  doc: PNode,
  pos: number, // position of structure we want to move
  nodeType: NodeType,
  direction: 'up' | 'down'
): number | null {
  const resolvedPosition = doc.resolve(pos);
  const containerNode = resolvedPosition.parent;
  const index = resolvedPosition.index();
  if (direction === 'up' && index !== 0) {
    return resolvedPosition.posAtIndex(index - 1);
  } else if (direction === 'down' && index !== containerNode.childCount - 1) {
    // We need to insert after the node below so we do index + 2 instead of index + 1
    return resolvedPosition.posAtIndex(index + 2);
  } else {
    const containerRange = findNodes(
      doc,
      pos,
      true,
      direction === 'up',
      ({ from }) => {
        const node = doc.nodeAt(from);
        if (node && node !== containerNode) {
          const indexToTest = direction === 'up' ? node.childCount : 0;
          if (node.canReplaceWith(indexToTest, indexToTest, nodeType)) {
            return true;
          }
        }
        return false;
      }
    ).next().value;
    if (containerRange) {
      const { from, to } = containerRange;
      return direction === 'up' ? to - 1 : from + 1;
    }
    return null;
  }
}

export default moveSelectedStructure;
