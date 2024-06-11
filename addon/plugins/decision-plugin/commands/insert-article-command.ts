import { NodeWithPos } from '@curvenote/prosemirror-utils';
import {
  Command,
  EditorState,
  PNode,
  TextSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  ELI,
  PROV,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  addPropertyToNode,
  findNodeByRdfaId,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { recalculateNumbers } from '../../structure-plugin/recalculate-structure-numbers';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';

interface InsertArticleArgs {
  node: PNode;
  decisionLocation: NodeWithPos;
}
export default function insertArticle({
  node,
  decisionLocation,
}: InsertArticleArgs): Command {
  return function (
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
  ): boolean {
    const decision = decisionLocation;
    const decisionResource = decision.node.attrs.subject;
    const container = getOutgoingTriple(decision.node.attrs, PROV('value'));
    if (container) {
      const location = findNodeByRdfaId(state.doc, container.object.value);
      if (location) {
        const insertLocation = location.pos + location.value.nodeSize - 1;
        const factory = new SayDataFactory();
        const tr = state.tr;
        const combiResult = transactionCombinator(
          state,
          tr.replaceWith(insertLocation, insertLocation, node),
        )([
          addPropertyToNode({
            resource: decisionResource,
            property: {
              predicate: ELI('has_part').full,
              object: factory.resourceNode(node.attrs.subject),
            },
          }),
          recalculateNumbers,
        ]);

        const { result, transaction } = combiResult;

        console.log('insertLocation', insertLocation);

        transaction.setSelection(
          TextSelection.create(
            transaction.doc,
            insertLocation + 1,
            insertLocation + node.nodeSize - 1,
          ),
        );

        transaction.scrollIntoView();
        if (result.every((ok) => ok)) {
          if (dispatch) {
            dispatch(transaction);
          }
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return false;
  };
}
