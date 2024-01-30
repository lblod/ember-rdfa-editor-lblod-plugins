import { PNode } from '@lblod/ember-rdfa-editor';
import { AttributeProperty } from '@lblod/ember-rdfa-editor/addon/core/rdfa-processor';
import { getProperties } from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';
import { getSnippetIdFromUri } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export const SNIPPET_LIST_RDFA_PREDICATE = SAY('allowedSnippetList');

export const getSnippetListIdsProperties = (
  node: PNode,
): AttributeProperty[] | undefined => {
  const properties = getProperties(node);

  if (!properties) {
    return undefined;
  }

  return properties.filter(
    (property): property is AttributeProperty =>
      (property.predicate === SNIPPET_LIST_RDFA_PREDICATE.prefixed ||
        property.predicate === SNIPPET_LIST_RDFA_PREDICATE.full) &&
      property.type === 'attribute',
  );
};

export const getAssignedSnippetListsIdsFromProperties = (
  snippetListIdsProperty: AttributeProperty[] | undefined,
) => {
  if (!snippetListIdsProperty) {
    return [];
  }

  const snippetListUris = snippetListIdsProperty
    .map((property) => property.object)
    .filter((object) => object !== undefined);

  if (snippetListUris.length === 0) {
    return [];
  }

  const snippetListIds = snippetListUris
    .map((uri) => {
      try {
        return getSnippetIdFromUri(JSON.parse(uri));
      } catch (e) {
        return undefined;
      }
    })
    .filter((id) => id !== undefined);

  return snippetListIds as string[];
};
