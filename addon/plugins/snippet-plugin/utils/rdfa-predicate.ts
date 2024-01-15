import { PNode } from '@lblod/ember-rdfa-editor';
import { AttributeProperty } from '@lblod/ember-rdfa-editor/addon/core/rdfa-processor';
import { getProperties } from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';

export const SNIPPET_LIST_RDFA_PREDICATE = 'say:snippetListIds';

export const getSnippetListIdsProperty = (
  node: PNode,
): AttributeProperty | undefined => {
  const properties = getProperties(node);

  if (!properties) {
    return undefined;
  }

  return properties.find(
    (property): property is AttributeProperty =>
      property.predicate === SNIPPET_LIST_RDFA_PREDICATE &&
      property.type === 'attribute',
  );
};

export const getAssignedSnippetListsIdsFromProperty = (
  snippetListIdsProperty: AttributeProperty | undefined,
) => {
  if (!snippetListIdsProperty) {
    return [];
  }

  if (snippetListIdsProperty.object === null) {
    return [];
  }

  const parsed = JSON.parse(snippetListIdsProperty.object) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed as string[];
};
