import { v4 as uuid } from 'uuid';
import {
  EditorState,
  findWrapping,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { findHowToWrapIncludingParents } from '@lblod/ember-rdfa-editor/utils/wrap-utils';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { generateStructureAttrs } from '../decision-plugin/utils/build-article-structure';
import {
  type StructurePluginOptions,
  type StructureType,
} from './structure-types';
import {
  calculateHierarchyRank,
  findRankInHierarchy,
  isHierarchyNode,
  STRUCTURE_HIERARCHY,
} from './structure-types';
import {
  isNone,
  isSome,
  type Option,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

/**
 * Find a transaction that will insert a given structure into the document based on the current
 * selection
 */
export function findHowToInsertStructure(
  state: EditorState,
  structureType: StructureType,
  uriGenerator: StructurePluginOptions['uriGenerator'],
): Transaction | false {
  const structConfig = STRUCTURE_HIERARCHY.find(
    ({ structureType: type }) => type === structureType,
  );
  const hierarchyRank =
    structConfig && findRankInHierarchy(structConfig.rdfType.full);
  if (!structConfig || isNone(hierarchyRank)) {
    console.warn(
      "Trying to insert a structure type that isn't valid",
      structureType,
    );
    return false;
  }
  let subject: string;
  if (typeof uriGenerator === 'function') {
    subject = uriGenerator(structureType);
  } else {
    subject =
      structConfig.resourceUri +
      (uriGenerator === 'uuid4' ? uuid() : `--ref-uuid4-${uuid()}`);
  }
  const structAttrs = generateStructureAttrs({ config: structConfig, subject });

  const { schema, selection } = state;
  // ### Find the nearest parent structure which is higher in the hierarchy

  // parents which are structure nodes, not necessarily higher in the hierarchy
  // parentStructures goes from nearest -> furthest
  const parentStructures = findAncestors(selection.$from, isHierarchyNode)
    .map(calculateHierarchyRank)
    .filter(isSome);
  if (selection instanceof NodeSelection) {
    // 'findAncestors' doesn't include the current selection, so incude it if relevant
    const node = selection.node;
    if (isHierarchyNode(node)) {
      const selectedStructureRank = calculateHierarchyRank({
        node,
        pos: selection.from,
      });
      if (isSome(selectedStructureRank)) {
        parentStructures.unshift(selectedStructureRank);
      }
    }
  }

  const closestAncestorRank = parentStructures[0]?.rank;
  // ### Either there is no parent structure or the nearest parent is higher in the hierarchy
  if (parentStructures.length === 0 || closestAncestorRank < hierarchyRank) {
    if (selection instanceof NodeSelection && isHierarchyNode(selection.node)) {
      // We're selecting a hierarchy node, so don't wrap, insert inside it
      const selFrom = selection.anchor;
      const node = schema.nodes['structure'].create(
        structAttrs,
        schema.nodes['paragraph'].create(),
      );
      return state.tr.replaceWith(selFrom + 1, selFrom + 1, node);
    }

    return findHowToWrapIncludingParents(
      state,
      schema.nodes['structure'],
      structAttrs,
    );
  } else {
    // ### We have parent structures that are lower in the hierarchy, so find one where we can insert
    for (let i = 0; i < parentStructures.length; i++) {
      const parentStructure = parentStructures[i];
      const parentRank = parentStructure.rank;
      if (hierarchyRank === parentRank) {
        // ### If parent we are looking at is same structure type, put an empty structure after that one
        const insertLocation =
          parentStructure.pos + parentStructure.node.nodeSize;
        const node = schema.nodes['structure'].create(
          structAttrs,
          schema.nodes['paragraph'].create(),
        );
        return state.tr.replaceWith(insertLocation, insertLocation, node);
      } else if (hierarchyRank < parentRank) {
        // ### Parent is a structure that can fit inside our new one. Look at the structure above
        // that to know how to insert
        const parentOfParentRank: Option<number> =
          parentStructures[i + 1] && parentStructures[i + 1].rank;
        if (isNone(parentOfParentRank) || parentOfParentRank < hierarchyRank) {
          // wrap parent and put inside parent of parent if it exists...
          const $from = state.doc.resolve(parentStructure.pos);
          const $to = state.doc.resolve(
            parentStructure.pos + parentStructure.node.nodeSize,
          );
          const range = $from.blockRange($to);
          const wrapping =
            range &&
            findWrapping(range, schema.nodes['structure'], structAttrs);
          if (wrapping) {
            return state.tr.wrap(range, wrapping);
          } else {
            return false;
          }
        }
      }
      // Keep looking
    }
    // This should never happen as all realistic cases should have been handled
    return false;
  }
}
