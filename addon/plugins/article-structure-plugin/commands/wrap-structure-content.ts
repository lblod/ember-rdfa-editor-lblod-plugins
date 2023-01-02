import { Command, PNode } from '@lblod/ember-rdfa-editor';
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

    let wrappingNode: PNode;
    try {
      wrappingNode = structureSpec.constructor({
        schema,
        content: contentToWrap,
        intl,
      });
    } catch (e) {
      return false;
    }
    if (dispatch) {
      const transaction = state.tr;
      transaction.replaceWith(pos + 1, pos + node.nodeSize - 1, wrappingNode);
      recalculateStructureNumbers(transaction, structureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

export default wrapStructureContent;
