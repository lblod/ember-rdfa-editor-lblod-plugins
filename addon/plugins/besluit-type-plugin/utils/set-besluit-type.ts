import { type EditorState } from '@lblod/ember-rdfa-editor';
import {
  transactionCombinator,
  type TransactionCombinatorResult,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import {
  addPropertyToNode,
  removePropertyFromNode,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { getCurrentBesluitURI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import {
  checkForDraftBesluitType,
  extractBesluitTypeUris,
  isValidTypeChoice,
  mostSpecificBesluitType,
  type BesluitTypeInstance,
} from './besluit-type-instances';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export function setBesluitType(
  initialState: EditorState,
  typeInstance: BesluitTypeInstance,
  isDraftDecisionType?: boolean,
): TransactionCombinatorResult<boolean> {
  const transaction = initialState.tr;

  const resource = getCurrentBesluitURI(initialState);
  if (!resource || !isValidTypeChoice(typeInstance)) {
    return {
      result: [false],
      initialState,
      transaction,
      transactions: [transaction],
    };
  }
  const existingTypeUris = extractBesluitTypeUris(initialState);
  const monads = existingTypeUris.map((existingUri) => {
    return removePropertyFromNode({
      resource,
      property: {
        predicate: RDF('type').full,
        object: sayDataFactory.namedNode(existingUri),
      },
    });
  });
  if (checkForDraftBesluitType(initialState)) {
    monads.push(
      removePropertyFromNode({
        resource,
        property: {
          predicate: EXT('isDraftDecisionType').full,
          object: sayDataFactory.literalNode('true'),
        },
      }),
    );
  }
  monads.push(
    addPropertyToNode({
      resource,
      property: {
        predicate: RDF('type').full,
        object: sayDataFactory.namedNode(
          mostSpecificBesluitType(typeInstance).uri,
        ),
      },
    }),
  );
  if (isDraftDecisionType) {
    monads.push(
      addPropertyToNode({
        resource,
        property: {
          predicate: EXT('isDraftDecisionType').full,
          object: sayDataFactory.literalNode('true'),
        },
      }),
    );
  }
  return transactionCombinator<boolean>(initialState)(monads);
}
