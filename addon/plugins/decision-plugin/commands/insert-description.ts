import {
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import { isNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCompliesWithShapes } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation/utils/transaction-complies-with-shapes';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';

interface InsertDescriptionArgs {
  placeholderText: string;
  validateShapes?: Set<string>;
}

export default function insertDescription({
  placeholderText,
  validateShapes,
}: InsertDescriptionArgs) {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { selection, schema } = state;
    const nodeToInsert = schema.node(
      'description',
      { __rdfaId: uuid() },
      schema.node(
        'paragraph',
        null,
        schema.node('placeholder', {
          placeholderText,
        })
      )
    );
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
      tr.setSelection(NodeSelection.create(tr.doc, insertionPos + 2));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}
