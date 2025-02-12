import { EditorState, PNode, TextSelection } from '@lblod/ember-rdfa-editor';
import {
  ELI,
  PROV,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  transactionCombinator,
  type TransactionMonad,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { recalculateNumbers } from '../../structure-plugin/recalculate-structure-numbers';
import {
  addPropertyToNode,
  findNodeByRdfaId,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { getNodesBySubject } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';

interface InsertArticleToDecisionArgs {
  node: PNode;
  decisionUri: string;
  insertFreely?: false;
}
interface InsertArticleFreelyArgs {
  node: PNode;
  insertFreely: true;
}

export function insertArticle(
  args: InsertArticleToDecisionArgs | InsertArticleFreelyArgs,
): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const { node } = args;
    if ('insertFreely' in args) {
      const tr = state.tr;
      const { result, transaction } = transactionCombinator(
        state,
        tr.replaceSelectionWith(node),
      )([recalculateNumbers]);

      transaction.scrollIntoView();
      return {
        initialState: state,
        transaction,
        result: result.every((ok) => ok),
      };
    }

    const { decisionUri } = args;
    const decision = getNodesBySubject(state, decisionUri)[0];
    if (!decision) {
      return {
        initialState: state,
        transaction: state.tr,
        result: false,
      };
    }
    const decisionResource = decision.value.attrs.subject;
    const container = getOutgoingTriple(decision.value.attrs, PROV('value'));
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

        transaction.setSelection(
          TextSelection.create(
            transaction.doc,
            insertLocation + 1,
            insertLocation + node.nodeSize - 1,
          ),
        );

        transaction.scrollIntoView();
        return {
          initialState: state,
          transaction,
          result: result.every((ok) => ok),
        };
      } else {
        return {
          initialState: state,
          transaction: state.tr,
          result: false,
        };
      }
    }
    return {
      initialState: state,
      transaction: state.tr,
      result: false,
    };
  };
}
