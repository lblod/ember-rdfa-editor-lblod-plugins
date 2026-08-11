import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { EditorState, Transaction, Command } from '@lblod/ember-rdfa-editor';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import {
  addPropertyToNode,
  updateSubject,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info/utils';
import { FOAF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { moveNodeSelectionForward } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/move-node-selection-forward';
import { Person } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/person';

export function getReplacePersonTransaction(
  state: EditorState,
  personNode: ResolvedPNode,
  newPerson: Person,
) {
  return transactionCombinator(state)([
    updateSubject({
      pos: personNode.pos,
      targetSubject: newPerson.uri,
      keepBacklinks: true,
      keepProperties: false,
      keepExternalTriples: true,
    }),
    addPropertyToNode({
      resource: newPerson.uri,
      property: {
        predicate: FOAF('givenName').full,
        object: sayDataFactory.literal(newPerson.firstName),
      },
    }),
    addPropertyToNode({
      resource: newPerson.uri,
      property: {
        predicate: FOAF('familyName').full,
        object: sayDataFactory.literal(newPerson.lastName),
      },
    }),
  ]);
}

export function replacePersonCommand(
  node: ResolvedPNode,
  newPerson: Person,
): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { transaction, result } = getReplacePersonTransaction(
      state,
      node,
      newPerson,
    );
    if (dispatch) {
      const newSelection = moveNodeSelectionForward(
        state.selection.map(transaction.doc, transaction.mapping),
        transaction.doc,
      );
      transaction.setSelection(newSelection);
      dispatch(transaction);
    }
    console.log(result);

    return result.every((res) => res);
  };
}
