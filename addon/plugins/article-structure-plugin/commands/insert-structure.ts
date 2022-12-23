import { Command } from '@lblod/ember-rdfa-editor';
import recalculateStructureNumbers from './recalculate-structure-number';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { findAncestorOfType } from '../utils/find-ancestor-of-type';

export const insertStructure = (structureSpec: StructureSpec): Command => {
  return (state, dispatch) => {
    const { schema, selection } = state;
    const contextNodeTypes = structureSpec.context
      .map((nodeType) => schema.nodes[nodeType])
      .filter((nodeSpec) => !!nodeSpec);
    const parent = findAncestorOfType(selection, ...contextNodeTypes);
    if (!parent) {
      return false;
    }
    const { depth } = parent;
    if (dispatch) {
      const newStructureNode = structureSpec.constructor(schema, 1);
      const transaction = state.tr;
      const insertPosition = selection.$from.after(depth + 1);
      transaction.insert(insertPosition, newStructureNode);
      recalculateStructureNumbers(transaction, structureSpec);
      dispatch(transaction);
    }
    return true;
  };
};
