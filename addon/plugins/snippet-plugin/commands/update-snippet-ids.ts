import { Command } from '@lblod/ember-rdfa-editor';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/addon/core/rdfa-processor';
import { SNIPPET_LIST_RDFA_PREDICATE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import { getSnippetUriFromId } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

const updateSnippetIds = ({
  resource,
  oldSnippetProperties,
  newSnippetIds,
}: {
  resource: string;
  oldSnippetProperties: OutgoingTriple[];
  newSnippetIds: string[];
}): Command => {
  return (state, dispatch) => {
    if (dispatch) {
      let transaction = state.tr;
      let newState = state;

      oldSnippetProperties.forEach((property) => {
        newState = state.apply(transaction);

        removeProperty({
          resource,
          property,
          transaction,
        })(newState, (newTransaction) => {
          transaction = newTransaction;
        });
      });

      newSnippetIds.forEach((snippetId) => {
        newState = state.apply(transaction);

        addProperty({
          resource,
          property: {
            predicate: SNIPPET_LIST_RDFA_PREDICATE.prefixed,
            object: sayDataFactory.namedNode(getSnippetUriFromId(snippetId)),
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

export default updateSnippetIds;
