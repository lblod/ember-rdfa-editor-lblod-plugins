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

interface InsertArticleToDecisionArgs {
  node: PNode;
  decisionLocation: NodeWithPos | null;
  insertFreely?: false;
}
interface InsertArticleFreelyArgs {
  node: PNode;
  insertFreely: true;
}

export default function insertArticle({
  node,
  ...args
}: InsertArticleToDecisionArgs | InsertArticleFreelyArgs): Command {
  return function (
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
  ): boolean {
    if ('insertFreely' in args) {
      const tr = state.tr;
      const { result, transaction } = transactionCombinator(
        state,
        tr.replaceSelectionWith(node),
      )([recalculateNumbers]);

      transaction.scrollIntoView();
      if (result.every((ok) => ok)) {
        if (dispatch) {
          dispatch(transaction);
        }
        return true;
      } else {
        return false;
      }
    }

    const decision = args.decisionLocation;
    if (!decision) {
      return false;
    }
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
