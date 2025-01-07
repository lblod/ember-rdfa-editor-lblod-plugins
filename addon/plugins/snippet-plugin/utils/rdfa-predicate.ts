import { type PNode } from '@lblod/ember-rdfa-editor';
import { type OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export const SNIPPET_LIST_RDFA_PREDICATE = SAY('allowedSnippetList');

const snippetListBase = 'http://lblod.data.gift/snippet-lists/';

export const getSnippetUriFromId = (id: string) => `${snippetListBase}${id}`;

export const getSnippetIdFromUri = (uri: string) =>
  uri.replace(snippetListBase, '');

export function tripleForSnippetListId(id: string) {
  return {
    predicate: SNIPPET_LIST_RDFA_PREDICATE.full,
    object: sayDataFactory.namedNode(getSnippetUriFromId(id)),
  };
}

export const getSnippetListIdsProperties = (node: PNode) => {
  return getOutgoingTripleList(node.attrs, SNIPPET_LIST_RDFA_PREDICATE);
};

export const getAssignedSnippetListsIdsFromProperties = (
  snippetListIdsProperty: OutgoingTriple[] | undefined = [],
) => {
  return snippetListIdsProperty
    .map((property) => property.object.value)
    .filter((object) => object !== undefined);
};

export const getSnippetListIdsFromNode = (node: PNode) =>
  getAssignedSnippetListsIdsFromProperties(getSnippetListIdsProperties(node));
