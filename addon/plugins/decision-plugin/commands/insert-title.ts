import { isNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import {
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { transactionCompliesWithShapes } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation/utils/transaction-complies-with-shapes';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { v4 as uuid } from 'uuid';
import { findInsertionPosInNode } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-node';
import {
  addPropertyToNode,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { ELI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

interface InsertTitleArgs {
  placeholderText: string;
  decisionLocation: NodeWithPos;
}

export default function insertTitle({
  placeholderText,
  decisionLocation,
}: InsertTitleArgs) {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { selection, schema } = state;
    const titleId = uuid();
    const nodeToInsert = schema.node(
      'block_rdfa',
      { rdfaNodeType: 'literal', __rdfaId: titleId },
      schema.node(
        'paragraph',
        null,
        schema.node('placeholder', {
          placeholderText,
        }),
      ),
    );

    const tr = state.tr;
    tr.replaceSelectionWith(nodeToInsert);

    const { transaction: newTr, result } = transactionCombinator<boolean>(
      state,
      tr,
    )([
      addPropertyToNode({
        resource: decisionLocation.node.attrs.subject,
        property: {
          predicate: ELI('title').full,
          object: { termType: 'LiteralNode', value: titleId },
        },
      }),
    ]);
    if (dispatch && result.every((ok) => ok)) {
      // newTr.setSelection(NodeSelection.create(newTr.doc, insertionPos + 2));
      dispatch(newTr.scrollIntoView());
    }
    return true;
  };
}
