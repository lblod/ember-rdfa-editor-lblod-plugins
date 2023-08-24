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
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';

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

    // special case when we reach `doc` but cannot replace the content
    // e.g. we reached doc, but there is "document_title article article", we might not be
    // able to wrap the title around single `article` node, depending on the `content` definiton
    // of the `doc`

    /**
     * Special case when we reach `doc` node, but cannot replace the content.
     * e.g. we reached doc, and it contains "document_title article article",
     * we might not be able to wrap single `article`, depending on the `content` definiton,
     * of the `doc`. Therefore we need to find sibling nodes of same type and try
     * to wrap them all together
     */
    if (currentAncestorParent.type.spec === schema.nodes.doc.spec) {
      const doc = currentAncestorParent;

      const start = pos <= 0 ? 0 : pos - 1;

      const filter = ({ from }: { from: number }) => {
        const node = doc.nodeAt(from);

        return node?.type.name === currentAncestor.type.name;
      };

      const previousNodeIterator = findNodes({
        doc,
        start,
        visitParentUpwards: true,
        reverse: true,
        filter: filter,
      });

      const nextNodeIterator = findNodes({
        doc,
        start,
        visitParentUpwards: true,
        reverse: false,
        filter,
      });

      let previousNodePosition: null | { from: number; to: number } = null;
      let nextNodePosition: null | { from: number; to: number } = null;

      for (const iter of previousNodeIterator) {
        previousNodePosition = iter;
      }

      for (const iter of nextNodeIterator) {
        nextNodePosition = iter;
      }

      if (previousNodePosition && nextNodePosition) {
        const node = doc.cut(
          previousNodePosition.from,
          nextNodePosition.to - 1,
        ).content;

        if (
          currentAncestorParent.canReplaceWith(
            doc.resolve(previousNodePosition.from).index(),
            doc.resolve(nextNodePosition.to).index(),
            nodeType,
          )
        ) {
          return {
            node: node,
            from: previousNodePosition.from,
            to: nextNodePosition.to,
          };
        }
      }
    }
  }
  return null;
}

export default wrapStructureContent;
