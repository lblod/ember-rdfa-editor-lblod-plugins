import type { EditorState, SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  TOPIC_PREDICATE,
  TOPIC_PREDICATE_DEPRECATED,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/commands/update-besluit-topic-resource';

const BESLUIT_THEMA_BASE_URI =
  'https://data.vlaanderen.be/id/concept/BesluitThema/';

export function extractBesluitTopicUris(
  controllerOrState: SayController | EditorState,
): string[] {
  const besluitRange = getCurrentBesluitRange(controllerOrState);
  if (!besluitRange) {
    return [];
  }

  const currentTopicTriples = getOutgoingTripleList(
    besluitRange.node.attrs,
    TOPIC_PREDICATE,
  );

  // TOPIC_PREDICATE_DEPRECATED is a fallback and only used if there are no triples with TOPIC_PREDICATE
  const topicTriples =
    currentTopicTriples.length > 0
      ? currentTopicTriples
      : getOutgoingTripleList(
          besluitRange.node.attrs,
          TOPIC_PREDICATE_DEPRECATED,
        );

  const topicUris = new Set<string>();
  for (const triple of topicTriples) {
    if (
      triple.object.termType === 'NamedNode' &&
      triple.object.value.includes(BESLUIT_THEMA_BASE_URI)
    ) {
      topicUris.add(triple.object.value);
    }
  }

  return [...topicUris];
}
