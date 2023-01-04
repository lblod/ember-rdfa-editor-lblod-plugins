import {
  Command,
  NodeSelection,
  NodeType,
  Selection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import wrapStructureContent from './wrap-structure-content';
import IntlService from 'ember-intl/services/intl';

const insertStructure = (
  structureSpec: StructureSpec,
  intl: IntlService
): Command => {
  return (state, dispatch) => {
    const { schema, selection } = state;
    const container = findInsertionContainer(
      selection,
      schema.nodes[structureSpec.name]
    );
    if (!container) {
      return wrapStructureContent(structureSpec, intl)(state, dispatch);
    }
    if (dispatch) {
      const { node: newStructureNode, selectionConfig } =
        structureSpec.constructor({ schema, intl });
      const transaction = state.tr;
      let insertRange: { from: number; to: number };
      if (
        container.node.childCount === 1 &&
        container.node.firstChild?.type === schema.nodes['paragraph'] &&
        container.node.firstChild.firstChild?.type ===
          schema.nodes['placeholder']
      ) {
        insertRange = {
          from: container.pos + 1,
          to: container.pos + container.node.nodeSize - 1,
        };
      } else {
        insertRange = {
          from: selection.$from.after(container.depth + 1),
          to: selection.$from.after(container.depth + 1),
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

function findInsertionContainer(selection: Selection, nodeType: NodeType) {
  const { $from } = selection;
  for (let currentDepth = $from.depth; currentDepth >= 0; currentDepth--) {
    const currentAncestor = $from.node(currentDepth);
    const index = $from.index(currentDepth);
    const pos = currentDepth > 0 ? $from.before(currentDepth) : -1;
    if (currentAncestor.canReplaceWith(index, index, nodeType)) {
      return { node: currentAncestor, depth: currentDepth, pos };
    }
  }
  return null;
}

export default insertStructure;
