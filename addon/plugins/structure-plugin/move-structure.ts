import {
  Command,
  PNode,
  ResolvedPos,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import {
  findNodePosDown,
  findNodePosUp,
} from '@lblod/ember-rdfa-editor/utils/position-utils';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { findAncestorOfType } from '../article-structure-plugin/utils/structure';
import {
  isNone,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { recalculateNumbers } from './recalculate-structure-numbers';
import { regenerateRdfaLinks } from './regenerate-rdfa-links';

export function moveStructure(direction: 'up' | 'down'): Command {
  return (state, dispatch) => {
    const { doc, selection, schema } = state;
    const structure = findAncestorOfType(selection, schema.nodes['structure']);
    if (!structure) {
      return false;
    }
    const { pos, node } = structure;
    const currentPos = node.attrs['number'];
    if (direction === 'up') {
      if (currentPos <= 1) {
        return false;
      }
      const previousStructurePos =
        findNodePosUp(doc, pos, ($pos: ResolvedPos) => {
          const nodeAfter = $pos.nodeAfter;
          if (nodeAfter) {
            return nodeAfter.type.name === 'structure';
          }
          return false;
        }).next().value ?? null;
      if (isNone(previousStructurePos)) {
        return false;
      } else {
        if (dispatch) {
          const transaction = state.tr;
          // we are moving the structure up, so if we delete it first, it won't affect the positions
          // before it
          transaction.delete(pos, pos + node.nodeSize);

          // previousStructurePos is the position right BEFORE the previous structure,
          // so inserting there is correct
          transaction.insert(previousStructurePos, node);
          // after updating we have to recalculate the numbers
          const { transaction: newTr } = transactionCombinator(
            state,
            transaction,
          )([recalculateNumbers, regenerateRdfaLinks]);

          // previousStructurePos should now point to the position right before our moved structure
          // so we can simply add 1 to get the first position inside of it, and for the end
          // we add the nodesize and subtract one
          newTr.setSelection(
            TextSelection.create(
              newTr.doc,
              previousStructurePos + 1,
              previousStructurePos + node.nodeSize - 1,
            ),
          );
          dispatch(newTr);
        }
        return true;
      }
    } else {
      // findNodePosUp and findNodePosDown have a different interface (historic reasons)
      const nextStructureParentPos =
        findNodePosDown(
          doc,
          doc.resolve(pos + node.nodeSize),
          (parent: PNode) => {
            return parent.type.name === 'structure';
          },
        ).next().value ?? null;
      if (isNone(nextStructureParentPos)) {
        return false;
      }
      // findNodePosDown has a weird quirk where it can only find positions IN nodes
      // cause the filter function only receives the position's parent
      // so we need to step back one here (or make a way more complicated filter)
      const nextStructurePos = nextStructureParentPos - 1;
      if (dispatch) {
        const transaction = state.tr;
        const $structurePos = doc.resolve(nextStructurePos);
        if (isNone($structurePos.nodeAfter)) {
          return false;
        }
        const nextStructureNode = unwrap($structurePos.nodeAfter);

        transaction.delete(pos, pos + node.nodeSize);
        const insertPos = transaction.mapping.map(
          nextStructurePos + nextStructureNode.nodeSize,
        );
        transaction.insert(insertPos, node);

        const { transaction: newTr } = transactionCombinator(
          state,
          transaction,
        )([recalculateNumbers, regenerateRdfaLinks]);

        // since we've deleted something before the insert position, we have to map
        // the positions through the transaction to find the moved node's new position
        newTr.setSelection(
          TextSelection.create(
            newTr.doc,
            insertPos + 1,
            insertPos + node.nodeSize - 1,
          ),
        );
        dispatch(newTr);
      }

      return true;
    }
  };
}
