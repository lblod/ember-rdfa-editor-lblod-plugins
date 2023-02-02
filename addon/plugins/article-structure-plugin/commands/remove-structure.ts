import { Command, PNode } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import recalculateStructureNumbers from './recalculate-structure-numbers';

type RemoveStructureArgs = {
  structure: { pos: number; node: PNode };
  specs: StructureSpec[];
};

const removeStructure = ({
  structure,
  specs,
}: RemoveStructureArgs): Command => {
  return (state, dispatch) => {
    if (dispatch) {
      const { pos, node } = structure;
      const transaction = state.tr;
      transaction.replace(pos, pos + node.nodeSize);
      recalculateStructureNumbers(transaction, ...specs);
      dispatch(transaction);
    }
    return true;
  };
};

export default removeStructure;
