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
import type { BesluitTargetGroup } from './types';
import { extractBesluitTargetGroupUris } from './extract-besluit-target-group-uris';
import { BESLUIT_TARGET_GROUP_PREDICATE } from './constants';

export function setBesluitTargetGroups(
  initialState: EditorState,
  targetGroups: BesluitTargetGroup[],
): TransactionCombinatorResult<boolean> {
  const transaction = initialState.tr;
  const besluitUri = getCurrentBesluitURI(initialState);
  if (!besluitUri) {
    return {
      result: [false],
      initialState,
      transaction,
      transactions: [transaction],
    };
  }
  const existingTargetGroupUris = extractBesluitTargetGroupUris(initialState);
  const monads = existingTargetGroupUris.map((existingUri) => {
    return removePropertyFromNode({
      resource: besluitUri,
      property: {
        predicate: BESLUIT_TARGET_GROUP_PREDICATE.full,
        object: sayDataFactory.namedNode(existingUri),
      },
    });
  });
  monads.push(
    ...targetGroups.map((targetGroup) => {
      return addPropertyToNode({
        resource: besluitUri,
        property: {
          predicate: BESLUIT_TARGET_GROUP_PREDICATE.full,
          object: sayDataFactory.namedNode(targetGroup.uri),
        },
      });
    }),
  );
  return transactionCombinator<boolean>(initialState)(monads);
}
