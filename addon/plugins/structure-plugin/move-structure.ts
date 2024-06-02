import {
  Command,
  NodeSelection,
  PNode,
  ResolvedPos,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { findAncestorOfType } from '../article-structure-plugin/utils/structure';
import {
  findNodePosDown,
  findNodePosUp,
} from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  isNone,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { recalculateNumbers } from './recalculate-structure-numbers';

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
      const previousStructure =
        findNodePosUp(doc, pos, ($pos: ResolvedPos) => {
          const node = $pos.nodeAfter;
          if (node) {
            return node.type.name === 'structure';
          }
          return false;
        }).next().value ?? null;
      if (isNone(previousStructure)) {
        return false;
      } else {
        if (dispatch) {
          const transaction = state.tr;
          transaction.delete(pos, pos + node.nodeSize);
          transaction.insert(previousStructure, node);
          const { transaction: newTr } = transactionCombinator(
            state,
            transaction,
          )([recalculateNumbers]);

          const newPos = newTr.mapping.map(previousStructure);
          const $newPos = newTr.doc.resolve(newPos);
          newTr.setSelection(new TextSelection($newPos));
          dispatch(newTr);
        }
        return true;
      }
    } else {
      const nextStructure =
        findNodePosDown(
          doc,
          doc.resolve(pos + node.nodeSize),
          (parent: PNode) => {
            return parent.type.name === 'structure';
          },
        ).next().value ?? null;
      if (isNone(nextStructure)) {
        return false;
      }
      if (dispatch) {
        const transaction = state.tr;
        const $structurePos = doc.resolve(nextStructure);
        const nextStructureNode = unwrap($structurePos.nodeAfter);

        transaction.insert(
          nextStructure + nextStructureNode.nodeSize + 1,
          node,
        );
        transaction.delete(pos, pos + node.nodeSize);

        const { transaction: newTr } = transactionCombinator(
          state,
          transaction,
        )([recalculateNumbers]);
        const newPos = newTr.mapping.map(
          nextStructure + nextStructureNode.nodeSize,
        );
        const $newPos = newTr.doc.resolve(newPos);
        newTr.setSelection(new TextSelection($newPos, $newPos));
        dispatch(newTr);
      }

      return true;
    }
  };
}
