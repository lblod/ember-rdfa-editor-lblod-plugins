import { Command, Selection } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { ArticleStructurePluginOptions } from '..';
import { findAncestorOfType } from '../utils';
import recalculateStructureNumbers from './recalculate-structure-number';

export const moveSelectedStructure = (
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
    const relativeSelectionOffset = selection.from - currentStructure.pos;
    const currentStructureSpec = unwrap(
      options.find((type) => type.name === currentStructure.node.type.name)
    );
    const nextNodeRange = findNodes(
      doc,
      currentStructure.pos,
      true,
      direction === 'up',
      ({ from }) => {
        const node = doc.nodeAt(from);
        return (
          !!node &&
          node !== currentStructure.node &&
          node.type === currentStructure.node.type
        );
      }
    ).next().value;
    if (!nextNodeRange) {
      return false;
    }
    if (dispatch) {
      const transaction = state.tr;
      if (direction === 'up') {
        transaction.replace(
          currentStructure.pos,
          currentStructure.pos + currentStructure.node.nodeSize
        );
        transaction.insert(nextNodeRange.from, currentStructure.node);
        const newSelection = Selection.near(
          transaction.doc.resolve(nextNodeRange.from + relativeSelectionOffset)
        );
        transaction.setSelection(newSelection);
      } else {
        transaction.insert(nextNodeRange.to, currentStructure.node);
        const newSelection = Selection.near(
          transaction.doc.resolve(nextNodeRange.to + relativeSelectionOffset)
        );
        transaction.setSelection(newSelection);
        transaction.replace(
          currentStructure.pos,
          currentStructure.pos + currentStructure.node.nodeSize
        );
      }
      recalculateStructureNumbers(transaction, currentStructureSpec);
      dispatch(transaction);
    }
    return true;
  };
};
