import { Command, PNode } from '@lblod/ember-rdfa-editor';
import { ArticleStructurePluginOptions } from '..';
import recalculateStructureNumbers from './recalculate-structure-numbers';

const removeStructure = (
  structure: { pos: number; node: PNode },
  options: ArticleStructurePluginOptions
): Command => {
  return (state, dispatch) => {
    if (dispatch) {
      const { pos, node } = structure;
      const transaction = state.tr;
      transaction.replace(pos, pos + node.nodeSize);
      recalculateStructureNumbers(transaction, ...options);
      dispatch(transaction);
    }
    return true;
  };
};

export default removeStructure;
