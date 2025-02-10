import { type PNode } from '@lblod/ember-rdfa-editor';
import {
  composeMonads,
  type TransactionMonad,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import {
  addPropertyToNode,
  getProperties,
  getSubject,
  removePropertyFromNode,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { isHierarchyNode } from './structure-types';

function linkAllChildrenToParent(parent: PNode): TransactionMonad<boolean>[] {
  const factory = new SayDataFactory();
  const parentResource = getSubject(parent);
  if (!parentResource) {
    console.warn(
      'Trying to update RDFa links for a structure node with no subject',
    );
    return [];
  }
  const monads: TransactionMonad<boolean>[] = [];

  // Remove existing links
  const existingLinks = getProperties(parent)?.filter((rel) =>
    SAY('hasPart').matches(rel.predicate),
  );
  existingLinks?.forEach((link) => {
    monads.push(
      removePropertyFromNode({ resource: parentResource, property: link }),
    );
  });

  parent.descendants((node) => {
    if (isHierarchyNode(node)) {
      const resource = getSubject(node);
      if (!resource) {
        console.warn(
          'Trying to update RDFa links for a structure node with no subject',
        );
        return false;
      }
      const monad = addPropertyToNode({
        resource: parentResource,
        property: {
          predicate: SAY('hasPart').full,
          object: factory.resourceNode(resource),
        },
      });
      monads.push(monad);

      // Recurse for children
      monads.push(...linkAllChildrenToParent(node));

      // Avoid `descendants()` from handling children, we do that with recursion
      return false;
    } else {
      // Look for hierarchy nodes within
      return true;
    }
  });
  return monads;
}

// TODO add support for decision structure nodes to this to remove their current manual linking
export const regenerateRdfaLinks = composeMonads((state) => {
  const monads: TransactionMonad<boolean>[] = [];
  // First find all the nodes that are in the hierarchy, but do not have a parent that is part of
  // the hierarchy ('top level' nodes)
  state.doc.descendants((topLevelNode) => {
    if (isHierarchyNode(topLevelNode)) {
      monads.push(...linkAllChildrenToParent(topLevelNode));
      // Avoid looking for 'top level' nodes within this node
      return false;
    } else {
      // Look for nodes within
      return true;
    }
  });
  return monads;
});
