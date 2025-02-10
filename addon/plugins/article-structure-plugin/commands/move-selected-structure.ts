import {
  Command,
  NodeSelection,
  NodeType,
  PNode,
  Schema,
  Selection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { ArticleStructurePluginOptions } from '..';
import { findAncestorOfType } from '../utils/structure';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';
import IntlService from 'ember-intl/services/intl';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

const moveSelectedStructure = (
  options: ArticleStructurePluginOptions,
  direction: 'up' | 'down',
  intl: IntlService,
): Command => {
  return (state, dispatch) => {
    const { doc, selection, schema } = state;
    const structureSpecs = options.map((type) => schema.nodes[type.name]);
    const currentStructure = findAncestorOfType(selection, ...structureSpecs);
    if (!currentStructure || currentStructure.pos === -1) {
      return false;
    }
    const currentStructureSpec = unwrap(
      options.find((spec) => spec.name === currentStructure.node.type.name),
    );
    const insertionRange = calculateInsertionRange({
      doc,
      pos: currentStructure.pos,
      nodeType: currentStructure.node.type,
      selection: state.selection,
      direction,
      schema,
      limitTo: currentStructureSpec.limitTo,
    });
    if (insertionRange === null || insertionRange === undefined) {
      return false;
    }
    const isNodeSelection = selection instanceof NodeSelection;
    const relativeSelectionOffset = selection.from - currentStructure.pos;

    if (dispatch) {
      const transaction = state.tr;
      transaction.delete(
        currentStructure.pos,
        currentStructure.pos + currentStructure.node.nodeSize,
      );
      const parent = doc.resolve(currentStructure.pos).parent;
      if (parent.childCount === 1) {
        const translationWithDocLang = getTranslationFunction(state);
        transaction.insert(
          currentStructure.pos,
          schema.node(schema.nodes['placeholder'], {
            placeholderText: translationWithDocLang(
              'article-structure-plugin.placeholder.generic.body',
              intl?.t('article-structure-plugin.placeholder.generic.body') ||
                '',
            ),
          }),
        );
      }
      const mappedFrom = transaction.mapping.map(insertionRange.from);
      const mappedTo =
        insertionRange.from === insertionRange.to
          ? mappedFrom
          : transaction.mapping.map(insertionRange.to);
      transaction.replaceWith(mappedFrom, mappedTo, currentStructure.node);
      const newSelectionPos = mappedFrom + relativeSelectionOffset;
      const newSelection = isNodeSelection
        ? NodeSelection.create(transaction.doc, newSelectionPos)
        : TextSelection.create(transaction.doc, newSelectionPos);
      transaction.setSelection(newSelection);
      transaction.scrollIntoView();
      recalculateStructureNumbers(transaction, schema, currentStructureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

export function calculateInsertionRange(args: {
  doc: PNode;
  pos: number; // position of structure we want to move
  selection: Selection;
  nodeType: NodeType;
  direction: 'up' | 'down';
  schema: Schema;
  limitTo?: string;
}): { from: number; to: number } | null {
  const { doc, pos, selection, nodeType, direction, schema, limitTo } = args;
  const resolvedPosition = doc.resolve(pos);
  const containerNode = resolvedPosition.parent;
  const index = resolvedPosition.index();
  if (direction === 'up' && index !== 0) {
    const position = resolvedPosition.posAtIndex(index - 1);
    return { from: position, to: position };
  } else if (direction === 'down' && index !== containerNode.childCount - 1) {
    // We need to insert after the node below so we do index + 2 instead of index + 1
    const position = resolvedPosition.posAtIndex(index + 2);
    return { from: position, to: position };
  } else {
    const limitContainer = limitTo
      ? findParentNodeOfType(schema.nodes[limitTo])(selection)
      : null;

    const limitContainerRange = limitContainer
      ? {
          from: limitContainer.pos,
          to: limitContainer.pos + limitContainer.node.nodeSize,
        }
      : { from: 0, to: doc.nodeSize };
    const containerRange = findNodes({
      doc,
      start: pos,
      visitParentUpwards: true,
      reverse: direction === 'up',
      filter: ({ from, to }) => {
        if (from >= limitContainerRange.from && to <= limitContainerRange.to) {
          const node = doc.nodeAt(from);
          if (node && node !== containerNode) {
            const indexToTest = direction === 'up' ? node.childCount : 0;
            if (node.canReplaceWith(indexToTest, indexToTest, nodeType)) {
              return true;
            }
          }
        }
        return false;
      },
    }).next().value;
    if (containerRange) {
      const { from, to } = containerRange;
      const containerRangeFirstNode = doc.nodeAt(from);
      if (!containerRangeFirstNode) return null;
      if (
        containerRangeFirstNode.firstChild?.type ===
          schema.nodes['paragraph'] &&
        containerRangeFirstNode.firstChild.firstChild?.type ===
          schema.nodes['placeholder']
      ) {
        return { from: from + 1, to: to - 1 };
      } else {
        const position = direction === 'up' ? to - 1 : from + 1;
        return { from: position, to: position };
      }
    }
    return null;
  }
}

export default moveSelectedStructure;
