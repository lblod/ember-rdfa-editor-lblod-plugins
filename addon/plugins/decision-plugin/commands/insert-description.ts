import { EditorState, Transaction } from '@lblod/ember-rdfa-editor';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { v4 as uuid } from 'uuid';
import {
  addPropertyToNode,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { ELI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

interface InsertDescriptionArgs {
  placeholderText: string;
  decisionLocation: NodeWithPos;
}

export default function insertDescription({
  placeholderText,
  decisionLocation,
}: InsertDescriptionArgs) {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { schema } = state;
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

    const factory = new SayDataFactory();
    const { transaction: newTr, result } = transactionCombinator<boolean>(
      state,
      tr,
    )([
      addPropertyToNode({
        resource: decisionLocation.node.attrs.subject,
        property: {
          predicate: ELI('description').full,
          object: factory.literalNode(descriptionId),
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
