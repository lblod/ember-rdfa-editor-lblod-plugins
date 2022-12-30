import {
  Command,
  NodeType,
  PNode,
  Schema,
  Selection,
} from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { ArticleStructurePluginOptions } from '..';
import { findAncestorOfType } from '../utils';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/position-utils';
const moveSelectedStructure = (
  options: ArticleStructurePluginOptions,
  direction: 'up' | 'down'
): Command => {
  return (state, dispatch) => {
    const { doc, selection, schema } = state;
    const structureSpecs = options.map((type) => schema.nodes[type.name]);
    const currentStructure = findAncestorOfType(selection, ...structureSpecs);
    if (!currentStructure || currentStructure.pos === -1) {
      return false;
    }
    const insertionPosition = calculateInsertionPosition(
      doc,
      currentStructure.pos,
      currentStructure.node.type,
      direction,
      schema
    );
    if (insertionPosition === null || insertionPosition === undefined) {
      return false;
    }
    const relativeSelectionOffset = selection.from - currentStructure.pos;
    const currentStructureSpec = unwrap(
      options.find((spec) => spec.name === currentStructure.node.type.name)
    );
    if (dispatch) {
      const transaction = state.tr;
      transaction.delete(
        currentStructure.pos,
        currentStructure.pos + currentStructure.node.nodeSize
      );
      const parent = doc.resolve(currentStructure.pos).parent;
      if (parent.childCount === 1) {
        transaction.insert(
          currentStructure.pos,
          schema.node(schema.nodes['placeholder'], {
            placeholderText: `Insert ${parent.type.name} content`,
          })
        );
      }
      let positionToSelect;
      if (insertionPosition[0] === insertionPosition[1]) {
        const mappedInsertionPosition = transaction.mapping.map(
          insertionPosition[0]
        );
        positionToSelect = mappedInsertionPosition;
        transaction.insert(mappedInsertionPosition, currentStructure.node);
      } else {
        const mappedFrom = transaction.mapping.map(insertionPosition[0]);
        const mappedTo = transaction.mapping.map(insertionPosition[1]);
        transaction.replaceWith(mappedFrom, mappedTo, currentStructure.node);
        positionToSelect = mappedFrom;
      }
      const newSelection = Selection.near(
        transaction.doc.resolve(positionToSelect + relativeSelectionOffset)
      );
      transaction.setSelection(newSelection);
      recalculateStructureNumbers(transaction, currentStructureSpec);
      dispatch(transaction);
    }
    return true;
  };
};

export function calculateInsertionPosition(
  doc: PNode,
  pos: number, // position of structure we want to move
  nodeType: NodeType,
  direction: 'up' | 'down',
  schema: Schema
): [number, number] | null {
  const resolvedPosition = doc.resolve(pos);
  const containerNode = resolvedPosition.parent;
  const index = resolvedPosition.index();
  if (direction === 'up' && index !== 0) {
    const position = resolvedPosition.posAtIndex(index - 1);
    return [position, position];
  } else if (direction === 'down' && index !== containerNode.childCount - 1) {
    // We need to insert after the node below so we do index + 2 instead of index + 1
    const position = resolvedPosition.posAtIndex(index + 2);
    return [position, position];
  } else {
    const containerRange = findNodes(
      doc,
      pos,
      true,
      direction === 'up',
      ({ from }) => {
        const node = doc.nodeAt(from);
        if (node && node !== containerNode) {
          const indexToTest = direction === 'up' ? node.childCount : 0;
          if (node.canReplaceWith(indexToTest, indexToTest, nodeType)) {
            return true;
          }
        }
        return false;
      }
    ).next().value;
    if (containerRange) {
      const { from, to } = containerRange;
      const resolvedPosition = doc.resolve(to);
      const container = resolvedPosition.parent;
      const content = container.lastChild;
      if (!content) return null;
      if (
        content.firstChild?.type === schema.nodes['paragraph'] &&
        content.firstChild.firstChild?.type === schema.nodes['placeholder']
      ) {
        return [from + 1, to - 1];
      } else {
        const position = direction === 'up' ? to - 1 : from + 1;
        return [position, position];
      }
    }
    return null;
  }
}

export default moveSelectedStructure;
