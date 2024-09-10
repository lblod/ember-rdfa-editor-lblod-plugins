import { PNode } from '@lblod/ember-rdfa-editor';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { getSnippetIdFromUri } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export const SNIPPET_LIST_RDFA_PREDICATE = SAY('allowedSnippetList');

export const getSnippetListIdsProperties = (node: PNode) => {
  return getOutgoingTripleList(node.attrs, SNIPPET_LIST_RDFA_PREDICATE);
};

export const getAssignedSnippetListsIdsFromProperties = (
  snippetListIdsProperty: OutgoingTriple[] | undefined = [],
) => {
  return snippetListIdsProperty
    .map((property) => property.object.value)
    .filter((object) => object !== undefined)
    .map(getSnippetIdFromUri)
    .filter((id) => id !== undefined);
};
