import {
  Command,
  NodeSelection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { findAncestorOfType } from '../utils';
import wrapStructureContent from './wrap-structure-content';
import IntlService from 'ember-intl/services/intl';

const insertStructure = (
  structureSpec: StructureSpec,
  intl: IntlService
): Command => {
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
    const index = selection.$from.index(depth);
    if (
      !parent.node.canReplaceWith(
        index + 1,
        index + 1,
        schema.nodes[structureSpec.name]
      )
    ) {
      return wrapStructureContent(structureSpec, parent, intl)(state, dispatch);
    }
    if (dispatch) {
      const { node: newStructureNode, selectionConfig } =
        structureSpec.constructor({ schema, intl });
      const transaction = state.tr;
      let insertRange: { from: number; to: number };
      if (
        parent.node.childCount === 1 &&
        parent.node.firstChild?.type === schema.nodes['paragraph'] &&
        parent.node.firstChild.firstChild?.type === schema.nodes['placeholder']
      ) {
        insertRange = {
          from: parent.pos + 1,
          to: parent.pos + parent.node.nodeSize - 1,
        };
      } else {
        insertRange = {
          from: selection.$from.after(depth + 1),
          to: selection.$from.after(depth + 1),
        };
      }

      transaction.replaceWith(
        insertRange.from,
        insertRange.to,
        newStructureNode
      );
      const newSelection =
        selectionConfig.type === 'node'
          ? NodeSelection.create(
              transaction.doc,
              insertRange.from + selectionConfig.relativePos
            )
          : TextSelection.create(
              transaction.doc,
              insertRange.from + selectionConfig.relativePos
            );
      transaction.setSelection(newSelection);
      recalculateStructureNumbers(transaction, structureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

export default insertStructure;
