import { Command, PNode } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import recalculateStructureNumbers from './recalculate-structure-numbers';

type UnwrapStructureArgs = {
  structure: {
    pos: number;
    node: PNode;
    type: StructureSpec;
  };
  specs: StructureSpec[];
};

const unwrapStructure = ({
  structure,
  specs,
}: UnwrapStructureArgs): Command => {
  return (state, dispatch) => {
    const { doc } = state;
    const { pos, node, type } = structure;
    if (!type.content) {
      return false;
    }
    const contentToUnwrap = type.content({ pos, state });

    const resolvedPos = doc.resolve(pos);
    const parent = resolvedPos.parent;
    const index = resolvedPos.index();
    if (!parent.canReplace(index, index + 1, contentToUnwrap)) {
      return false;
    }
    if (dispatch) {
      const transaction = state.tr;
      transaction.replaceWith(pos, pos + node.nodeSize, contentToUnwrap);
      recalculateStructureNumbers(transaction, ...specs);
      dispatch(transaction);
    }
    return true;
  };
};

export default unwrapStructure;
