import {
  Command,
  NodeSelection,
  PNode,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import IntlService from 'ember-intl/services/intl';
import recalculateStructureNumbers from './recalculate-structure-numbers';

const wrapStructureContent = (
  structureSpec: StructureSpec,
  parent: {
    node: PNode;
    pos: number;
  },
  intl: IntlService
): Command => {
  return (state, dispatch) => {
    const { schema } = state;
    const { node, pos } = parent;
    if (
      !node.canReplaceWith(0, node.childCount, schema.nodes[structureSpec.name])
    ) {
      return false;
    }
    const contentToWrap = node?.content;
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
      transaction.replaceWith(pos + 1, pos + node.nodeSize - 1, wrappingNode);
      const newSelection =
        selectionConfig.type === 'node'
          ? NodeSelection.create(
              transaction.doc,
              pos + 1 + selectionConfig.relativePos
            )
          : TextSelection.create(
              transaction.doc,
              pos + 1 + selectionConfig.relativePos
            );
      transaction.setSelection(newSelection);
      recalculateStructureNumbers(transaction, structureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

export default wrapStructureContent;
