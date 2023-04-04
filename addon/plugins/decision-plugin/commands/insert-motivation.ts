import {
  Command,
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import { isNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCompliesWithShapes } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation/utils/transaction-complies-with-shapes';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';

interface InsertMotivationArgs {
  placeholderText?: string;
  validateShapes?: Set<string>;
}

export default function insertMotivation({
  validateShapes,
  placeholderText = 'Insert motivation',
}: InsertMotivationArgs = {}): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { selection, schema } = state;
    const nodeToInsert = schema.node('motivering', { __rdfaId: uuid() }, [
      schema.node(
        'paragraph',
        null,
        schema.node('placeholder', {
          placeholderText,
        })
      ),
    ]);
    // how the offset between the insertion point and the point where the cursor should end up
    const cursorOffset = 2;

    const insertionPos = findInsertionPosInAncestorOfType(
      selection,
      schema.nodes.besluit,
      nodeToInsert
    );
    if (isNone(insertionPos)) {
      return false;
    }
    const tr = state.tr;

    tr.replaceRangeWith(insertionPos, insertionPos, nodeToInsert);
    if (!transactionCompliesWithShapes(state, tr, validateShapes)) {
      return false;
    }
    if (dispatch) {
      console.log('inserts in ', insertionPos);
      console.log('selection on ', insertionPos + cursorOffset);
      const selectionPos = tr.doc.resolve(insertionPos + cursorOffset);
      // const targetPos = tr.doc.resolve(insertionPos + cursorOffset + 1);
      // TODO figure out why I cant just set a nodeSelection here
      tr.setSelection(
        new NodeSelection(tr.doc.resolve(selectionPos.posAtIndex(0)))
      );
      dispatch(tr);
    }
    return true;
  };
}
