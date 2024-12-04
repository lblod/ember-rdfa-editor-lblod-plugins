import { BesluitTopic } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/fetchBesluitTopics';
import { Command } from '@lblod/ember-rdfa-editor';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  DCT,
  ELI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export const TOPIC_PREDICATE = DCT('subject');
export const TOPIC_PREDICATE_DEPRECATED = ELI('is_about');

export const updateBesluitTopicResource = ({
  resource,
  previousTopics,
  newTopics,
}: {
  resource: string;
  previousTopics: string[] | undefined;
  newTopics: BesluitTopic[];
}): Command => {
  return (state, dispatch) => {
    if (dispatch) {
      let transaction = state.tr;
      let newState = state;

      if (previousTopics) {
        previousTopics.forEach((uri) => {
          newState = state.apply(transaction);

          [TOPIC_PREDICATE, TOPIC_PREDICATE_DEPRECATED].forEach((PREDICATE) =>
            removeProperty({
              resource,
              property: {
                predicate: PREDICATE.full,
                object: sayDataFactory.namedNode(uri),
              },
              transaction,
            })(newState, (newTransaction) => {
              transaction = newTransaction;
            }),
          );
        });
      }

      newTopics.forEach((besluitTopic) => {
        newState = state.apply(transaction);

        addProperty({
          resource,
          property: {
            predicate: TOPIC_PREDICATE.full,
            object: sayDataFactory.namedNode(besluitTopic.uri),
          },
          transaction,
        })(newState, (newTransaction) => {
          transaction = newTransaction;
        });
      });

      dispatch(transaction);
    }
    return true;
  };
};
