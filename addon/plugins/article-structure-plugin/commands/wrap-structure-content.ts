import {
  Command,
  NodeSelection,
  NodeType,
  PNode,
  Selection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import IntlService from 'ember-intl/services/intl';
import recalculateStructureNumbers from './recalculate-structure-numbers';

const wrapStructureContent = (
  structureSpec: StructureSpec,
  intl: IntlService
): Command => {
  return (state, dispatch) => {
    const { selection, schema } = state;
    const container = findInsertionContainer(
      selection,
      schema.nodes[structureSpec.name]
    );
    if (!container) {
      return false;
    }
    // const { node, pos } = parent;
    // if (
    //   !node.canReplaceWith(0, node.childCount, schema.nodes[structureSpec.name])
    // ) {
    //   return false;
    // }
    const contentToWrap = container.node.content;

    let result: {
      node: PNode;
      selectionConfig: {
        relativePos: number;
        type: 'node' | 'text';
      };
    };
    try {
      result = structureSpec.constructor({
        schema,
        content: contentToWrap,
        intl,
      });
    } catch (e) {
      return false;
    }
    const { node: wrappingNode, selectionConfig } = result;
    if (dispatch) {
      const transaction = state.tr;
      transaction.replaceWith(
        container.pos + 1,
        container.pos + container.node.nodeSize - 1,
        wrappingNode
      );
      const newSelection =
        selectionConfig.type === 'node'
          ? NodeSelection.create(
              transaction.doc,
              container.pos + 1 + selectionConfig.relativePos
            )
          : TextSelection.create(
              transaction.doc,
              container.pos + 1 + selectionConfig.relativePos
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
    const pos = currentDepth > 0 ? $from.before(currentDepth) : -1;
    if (
      currentAncestor.canReplaceWith(0, currentAncestor.childCount, nodeType)
    ) {
      return { node: currentAncestor, depth: currentDepth, pos };
    }
  }
  return null;
}

export default wrapStructureContent;
