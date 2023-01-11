import {
  Command,
  Fragment,
  NodeSelection,
  NodeType,
  PNode,
  Schema,
  Selection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import wrapStructureContent from './wrap-structure-content';
import IntlService from 'ember-intl/services/intl';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { containsOnlyPlaceholder } from '../utils/structure';

const insertStructure = (
  structureSpec: StructureSpec,
  intl: IntlService,
  content?: Fragment
): Command => {
  return (state, dispatch) => {
    const { schema, selection, doc } = state;
    const insertionRange = findInsertionRange({
      doc,
      selection,
      nodeType: schema.nodes[structureSpec.name],
      schema,
    });
    if (!insertionRange) {
      return wrapStructureContent(structureSpec, intl)(state, dispatch);
    }
    if (dispatch) {
      const { node: newStructureNode, selectionConfig } =
        structureSpec.constructor({ schema, intl, content });
      const transaction = state.tr;

      transaction.replaceWith(
        insertionRange.from,
        insertionRange.to,
        newStructureNode
      );
      const newSelection =
        selectionConfig.type === 'node'
          ? NodeSelection.create(
              transaction.doc,
              insertionRange.from + selectionConfig.relativePos
            )
          : TextSelection.create(
              transaction.doc,
              insertionRange.from + selectionConfig.relativePos
            );
      transaction.setSelection(newSelection);
      transaction.scrollIntoView();
      recalculateStructureNumbers(transaction, structureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

function findInsertionRange(args: {
  doc: PNode;
  selection: Selection;
  nodeType: NodeType;
  schema: Schema;
}) {
  const { doc, selection, nodeType, schema } = args;
  const { $from } = selection;
  for (let currentDepth = $from.depth; currentDepth >= 0; currentDepth--) {
    const currentAncestor = $from.node(currentDepth);
    const index = $from.index(currentDepth);
    if (currentAncestor.canReplaceWith(index, index, nodeType)) {
      if (containsOnlyPlaceholder(schema, currentAncestor)) {
        return { from: $from.start(currentDepth), to: $from.end(currentDepth) };
      } else {
        const insertPos = $from.after(currentDepth + 1);
        return { from: insertPos, to: insertPos };
      }
    }
  }
  const nextContainerRange = findNodes(
    doc,
    selection.from,
    true,
    false,
    ({ from }) => {
      const node = doc.nodeAt(from);
      if (node) {
        if (node.canReplaceWith(node.childCount, node.childCount, nodeType)) {
          return true;
        }
      }
      return false;
    }
  ).next().value;
  if (nextContainerRange) {
    const { from, to } = nextContainerRange;
    const containerNode = doc.nodeAt(from);
    if (containerNode) {
      if (containsOnlyPlaceholder(schema, containerNode)) {
        return { from: from + 1, to: to - 1 };
      } else {
        return { from: to - 1, to: to - 1 };
      }
    }
  }
  return null;
}

export default insertStructure;
