import {
  Command,
  NodeSelection,
  NodeType,
  PNode,
  Schema,
  Selection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import IntlService from 'ember-intl/services/intl';
import recalculateStructureNumbers from './recalculate-structure-numbers';

const wrapStructureContent = (
  structureSpec: StructureSpec,
  intl: IntlService,
): Command => {
  return (state, dispatch) => {
    if (!structureSpec.content) {
      return false;
    }
    const { selection, schema } = state;
    const container = findInsertionContainer(
      selection,
      schema.nodes[structureSpec.name],
      schema,
    );
    if (!container) {
      return false;
    }
    const contentToWrap = container.node;
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
        state,
      });
    } catch (e) {
      return false;
    }
    const { node: wrappingNode, selectionConfig } = result;
    if (dispatch) {
      const transaction = state.tr;
      transaction.replaceWith(container.from, container.to, wrappingNode);
      const newSelection =
        selectionConfig.type === 'node'
          ? NodeSelection.create(
              transaction.doc,
              container.from + 1 + selectionConfig.relativePos,
            )
          : TextSelection.create(
              transaction.doc,
              container.from + 1 + selectionConfig.relativePos,
            );
      transaction.setSelection(newSelection);
      transaction.scrollIntoView();
      recalculateStructureNumbers(transaction, structureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

function findInsertionContainer(
  selection: Selection,
  nodeType: NodeType,
  schema: Schema,
) {
  const { $from } = selection;
  for (let currentDepth = $from.depth; currentDepth >= 0; currentDepth--) {
    const currentAncestor = $from.node(currentDepth);
    const pos = currentDepth > 0 ? $from.before(currentDepth) : -1;

    // Simple like for like replacement from 0th index
    if (
      currentAncestor.canReplaceWith(0, currentAncestor.childCount, nodeType)
    ) {
      return {
        node: currentAncestor.content,
        from: pos + 1,
        to: pos + currentAncestor.nodeSize - 1,
      };
    }

    const currentAncestorParent = $from.node(currentDepth - 1);
    const currentAncestorIndexInParent = $from.index(currentDepth - 1);

    if (!currentAncestorParent) {
      return null;
    }

    // Sometimes we might not be able to replace from 0th index, but we can try to go one
    // level up and attempt to replace `currentAncestor` as a child of its parent
    if (
      currentAncestorParent.canReplaceWith(
        currentAncestorIndexInParent,
        currentAncestorIndexInParent + 1,
        nodeType,
      )
    ) {
      return {
        node: currentAncestor,
        from: pos,
        to: pos + currentAncestor.nodeSize - 1,
      };
    }

    /**
     * Special case when we reach `doc` node, but cannot replace the content.
     * e.g. we reached doc, and it contains "document_title article article",
     * we might not be able to wrap single `article`, depending on the `content` definition,
     * of the `doc`. We try to find sibling nodes of same type and try
     * to wrap them all together, that includes the content that might be between them.
     */
    if (currentAncestorParent.type.spec === schema.nodes.doc.spec) {
      const doc = currentAncestorParent;

      let firstOfTypePosition: null | number = null;
      let lastOfTypePosition: null | number = null;

      currentAncestorParent.forEach((node, pos) => {
        if (node.type === currentAncestor.type) {
          if (!firstOfTypePosition) {
            firstOfTypePosition = pos;
          }

          lastOfTypePosition = pos;
        }
      });

      if (firstOfTypePosition !== null && lastOfTypePosition !== null) {
        const from = firstOfTypePosition;
        const to = doc.resolve(lastOfTypePosition).end();

        const node = doc.cut(from, to).content;

        if (
          currentAncestorParent.canReplaceWith(
            doc.resolve(from).index(),
            doc.resolve(to).index(),
            nodeType,
          )
        ) {
          return {
            node,
            from,
            to,
          };
        }
      }
    }
  }
  return null;
}

export default wrapStructureContent;
