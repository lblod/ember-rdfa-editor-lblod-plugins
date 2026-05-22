import { Attrs, type PNode } from '@lblod/ember-rdfa-editor';
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
import { isHierarchyNode } from '../structure-types';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { difference } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/set-utils';
import { isSome } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

const factory = new SayDataFactory();

/**
 * Generate monads to recursively sync the RDFa links with the actual document structure
 * of the given structure node and its descendants.
 *
 * Takes the document hierarchy as the source of truth, and updates the rdfa links to match.
 *
 * Currently this is being called every transaction that modifies any structure node,
 * which includes typing inside one. As such, the implementation should take care to avoid
 * generating unnecessary updates.
 *
 * @param parent A structure node
 * @returns a list of monads which will update the structures as described
 */
function linkAllChildrenToParent(parent: PNode): TransactionMonad<boolean>[] {
  const parentResource = getSubject(parent);
  if (!parentResource) {
    console.warn(
      'Trying to update RDFa links for a structure node with no subject',
    );
    return [];
  }
  const monads: TransactionMonad<boolean>[] = [];

  const childStructures: PNode[] = [];

  // collect all direct structure-node descendants, skipping non-structure nodes
  // which is why the rest of the function calls them "children" even if they might
  // not be direct children in the strict sense
  parent.descendants((node) => {
    if (isHierarchyNode(node)) {
      childStructures.push(node);
      return false;
    }
    return true;
  });

  const documentChildSubjects = new Set(
    // As far as this function is concerned,
    // it will handle child structures without a subject just fine, so we can filter them out
    // Any dangling reference to them in the parent will be removed.
    // However, it is definitely unexpected and likely will break other things
    childStructures.map((node) => getSubject(node)).filter(isSome),
  );

  const parentProps = getProperties(parent) ?? [];
  const rdfaChildSubjects = new Set(
    parentProps
      .filter((p) => SAY('hasPart').matches(p.predicate))
      .map((p) => p.object.value),
  );

  // calculating this is highly worth doing, since there will usually be no differences
  // and avoiding the extra transactions is very worth it
  const toBeDeleted = difference(rdfaChildSubjects, documentChildSubjects);
  const toBeAdded = difference(documentChildSubjects, rdfaChildSubjects);

  // generate the monads to update the props
  for (const subject of toBeDeleted) {
    monads.push(...removeChildLinks(parent.attrs, parentResource, subject));
  }
  for (const subject of toBeAdded) {
    monads.push(addChildLink(parentResource, subject));
  }

  // recurse down for each child
  for (const child of childStructures) {
    monads.push(...linkAllChildrenToParent(child));
  }

  return monads;
}

/**
 * Generate monad to remove child from the parent's node attrs
 *
 * @param parentAttrs the prosemirror attrs of the parent
 * @param parentSubject
 * @param childSubject
 * @returns list of monads to remove each property
 *
 * @private
 */
function removeChildLinks(
  parentAttrs: Attrs,
  parentSubject: string,
  childSubject: string,
) {
  const toRemove = getOutgoingTripleList(parentAttrs, SAY('hasPart')).filter(
    (t) => t.object.value === childSubject,
  );
  return toRemove.map((prop) =>
    removePropertyFromNode({ resource: parentSubject, property: prop }),
  );
}

/**
 * Generate monad to add child to the parent's rdfa props
 *
 * @param parentSubject
 * @param childSubject
 * @returns monad to add the child to the parent with a 'hasPart' predicate
 *
 * @private
 */
function addChildLink(parentSubject: string, childSubject: string) {
  return addPropertyToNode({
    resource: parentSubject,
    property: {
      predicate: SAY('hasPart').full,
      object: factory.resourceNode(childSubject),
    },
  });
}

// TODO add support for decision structure nodes to this to remove their current manual linking
/**
 * Generate monads to update the rdfa-hierarchy of all structure nodes to match their document hierarchy
 * @see {@link linkAllChildrenToParent} for more details
 *
 * @returns list of monads to perform the update on the whole doc
 */
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
