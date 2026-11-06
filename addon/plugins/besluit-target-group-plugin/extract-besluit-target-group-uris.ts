import type { EditorState, SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { BESLUIT_TARGET_GROUP_PREDICATE } from './constants';

export function extractBesluitTargetGroupUris(
  controllerOrState: SayController | EditorState,
): string[] {
  const besluitRange = getCurrentBesluitRange(controllerOrState);
  if (!besluitRange) {
    return [];
  }

  const targetGroupTriples = getOutgoingTripleList(
    besluitRange.node.attrs,
    BESLUIT_TARGET_GROUP_PREDICATE,
  );

  const topicUris = new Set<string>();
  for (const triple of targetGroupTriples) {
    if (triple.object.termType === 'NamedNode') {
      topicUris.add(triple.object.value);
    }
  }

  return [...topicUris];
}
