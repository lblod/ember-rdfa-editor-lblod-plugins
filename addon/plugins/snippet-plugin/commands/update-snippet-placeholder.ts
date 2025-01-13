import { Command } from '@lblod/ember-rdfa-editor';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { SNIPPET_LIST_RDFA_PREDICATE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import { type OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  type ImportedResourceMap,
  type SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { importedResourcesFromSnippetLists } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';

export const updateSnippetPlaceholder = ({
  resource,
  oldSnippetProperties,
  newSnippetLists,
  oldImportedResources,
  node,
  allowMultipleSnippets = false,
}: {
  resource: string;
  oldSnippetProperties: OutgoingTriple[];
  newSnippetLists: SnippetList[];
  oldImportedResources: ImportedResourceMap;
  node: ResolvedPNode;
  allowMultipleSnippets?: boolean;
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

      newSnippetLists.forEach((list) => {
        newState = state.apply(transaction);

        addProperty({
          resource,
          property: {
            predicate: SNIPPET_LIST_RDFA_PREDICATE.prefixed,
            object: sayDataFactory.namedNode(list.uri),
          },
          transaction,
        })(newState, (newTransaction) => {
          transaction = newTransaction;
        });
      });
      transaction = transaction.setNodeAttribute(
        node.pos,
        'snippetListNames',
        newSnippetLists.map((list) => list.label),
      );
      transaction = transaction.setNodeAttribute(
        node.pos,
        'importedResources',
        importedResourcesFromSnippetLists(
          newSnippetLists,
          oldImportedResources,
        ),
      );
      transaction = transaction.setNodeAttribute(
        node.pos,
        'allowMultipleSnippets',
        allowMultipleSnippets,
      );

      dispatch(transaction);
    }
    return true;
  };
};
