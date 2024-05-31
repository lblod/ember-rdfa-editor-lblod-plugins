import {
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { isNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCompliesWithShapes } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation/utils/transaction-complies-with-shapes';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { v4 as uuid } from 'uuid';
import { findInsertionPosInNode } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-node';
import {
  addPropertyToNode,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import {
  ELI,
  PROV,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

interface InsertDescriptionArgs {
  placeholderText: string;
  decisionLocation: NodeWithPos;
}

export default function insertDescription({
  placeholderText,
  decisionLocation,
}: InsertDescriptionArgs) {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { selection, schema } = state;
    const descriptionId = uuid();
    const nodeToInsert = schema.node(
      'block_rdfa',
      { rdfaNodeType: 'literal', __rdfaId: descriptionId },
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
          predicate: ELI('description').full,
          object: { termType: 'LiteralNode', value: descriptionId },
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
