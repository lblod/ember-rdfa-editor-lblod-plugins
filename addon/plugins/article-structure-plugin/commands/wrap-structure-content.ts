import IntlService from 'ember-intl/services/intl';
import {
  Command,
  Fragment,
  NodeSelection,
  NodeType,
  PNode,
  Schema,
  Selection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  SpecConstructorResult,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import recalculateStructureNumbers from './recalculate-structure-numbers';

const wrapStructureContent = (
  structureSpec: StructureSpec,
  intl: IntlService,
): Command => {
  return (state, dispatch) => {
    if (!structureSpec.content) {
      return false;
    }
    const { selection, schema } = state;
    const [container, resourceHierarchy] = findInsertionContainer(
      selection,
      schema.nodes[structureSpec.name],
      schema,
    );
    if (!container) {
      return false;
    }
    const contentToWrap = container.node;
    let result: SpecConstructorResult;
    if (dispatch) {
      try {
        result = structureSpec.constructor({
          schema,
          content: contentToWrap,
          intl,
          state,
        });
      } catch (e) {
        return false;
      }
      const { node: wrappingNode, selectionConfig, newResource } = result;
      let transaction = state.tr;
      transaction.replaceWith(container.from, container.to, wrappingNode);

      const target = getNodeByRdfaId(
        state.apply(transaction),
        selectionConfig.rdfaId,
      );
      if (target) {
        const newSelection =
          selectionConfig.type === 'node'
            ? NodeSelection.create(transaction.doc, target.pos)
            : TextSelection.create(transaction.doc, target.pos + 1);
        transaction.setSelection(newSelection);
      }

      transaction.scrollIntoView();
      recalculateStructureNumbers(transaction, schema, structureSpec);

      const { toCreate, toRemove } = findUpdatedRelationships({
        contentToWrap,
        resourceHierarchy,
        newResource,
      });
      let newState = state;
      toCreate.forEach(([outer, inner]) => {
        newState = state.apply(transaction);
        addProperty({
          resource: outer,
          property: {
            predicate: (structureSpec.relationshipPredicate ?? SAY('hasPart'))
              .prefixed,
            object: sayDataFactory.resourceNode(inner),
          },
          transaction,
        })(newState, (newTransaction) => {
          transaction = newTransaction;
        });
      });
      toRemove.forEach(([outer, inner]) => {
        newState = state.apply(transaction);
        removeProperty({
          resource: outer,
          property: {
            predicate: (structureSpec.relationshipPredicate ?? SAY('hasPart'))
              .prefixed,
            object: sayDataFactory.resourceNode(inner),
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

type ContainerNode = { node: PNode | Fragment; from: number; to: number };
function findInsertionContainer(
  selection: Selection,
  nodeType: NodeType,
  schema: Schema,
): [ContainerNode | null, string[]] {
  const { $from } = selection;
  let container: ContainerNode | null = null;
  const resourceHierarchy: string[] = [];
  // Loop from current depth to top looking for a container and subject URIs
  for (let currentDepth = $from.depth; currentDepth >= 0; currentDepth--) {
    const currentAncestor = $from.node(currentDepth);
    const subject = currentAncestor.attrs?.subject as string | undefined;
    if (subject) {
      resourceHierarchy.unshift(subject);
    }
    if (!container) {
      const pos = currentDepth > 0 ? $from.before(currentDepth) : -1;

      // Simple like for like replacement from 0th index
      if (
        currentAncestor.canReplaceWith(0, currentAncestor.childCount, nodeType)
      ) {
        container = {
          node: currentAncestor.content,
          from: pos + 1,
          to: pos + currentAncestor.nodeSize - 1,
        };
      }

      const currentAncestorParent = $from.node(currentDepth - 1);
      const currentAncestorIndexInParent = $from.index(currentDepth - 1);

      if (!currentAncestorParent) {
        break;
      }

      // Sometimes we might not be able to replace from 0th index, but we can try to go one
      // level up and attempt to replace `currentAncestor` as a child of its parent
      if (
        currentAncestorParent.canReplaceWith(
          currentAncestorIndexInParent,
          currentAncestorIndexInParent + 1,
          nodeType,
        )
      ) {
        container = {
          node: currentAncestor,
          from: pos,
          to: pos + currentAncestor.nodeSize - 1,
        };
      }

      /**
       * Special case when we reach `doc` node, but cannot replace the content.
       * e.g. we reached doc, and it contains "document_title article article",
       * we might not be able to wrap single `article`, depending on the `content` definition,
       * of the `doc`. We try to find sibling nodes of same type and try
       * to wrap them all together, that includes the content that might be between them.
       */
      if (currentAncestorParent.type.spec === schema.nodes.doc.spec) {
        const doc = currentAncestorParent;

        let firstOfTypePosition: null | number = null;
        let lastOfTypePosition: null | number = null;

        currentAncestorParent.forEach((node, pos) => {
          if (node.type === currentAncestor.type) {
            if (!firstOfTypePosition) {
              firstOfTypePosition = pos;
            }

            lastOfTypePosition = pos;
          }
        });

        if (firstOfTypePosition !== null && lastOfTypePosition !== null) {
          const from = firstOfTypePosition;
          const to = doc.resolve(lastOfTypePosition).end();

          const node = doc.cut(from, to).content;

          if (
            currentAncestorParent.canReplaceWith(
              doc.resolve(from).index(),
              doc.resolve(to).index(),
              nodeType,
            )
          ) {
            container = {
              node,
              from,
              to,
            };
          }
        }
      }
    }
  }
  return [container, resourceHierarchy];
}

function findUpdatedRelationships({
  contentToWrap,
  newResource,
  resourceHierarchy,
}: {
  contentToWrap: PNode | Fragment;
  newResource: string;
  resourceHierarchy: string[];
}): { toCreate: [string, string][]; toRemove: [string, string][] } {
  const wrappedResource = (
    'attrs' in contentToWrap
      ? contentToWrap.attrs
      : contentToWrap.firstChild?.attrs
  )?.subject as string;

  const toCreate: [string, string][] = [];
  const toRemove: [string, string][] = [];
  if (resourceHierarchy.length === 0) {
    // There are no existing resources, so no relationships
  } else if (!wrappedResource) {
    // There's no resource inside the new resource, so the only potential relationship is with the
    // inner resource of the existing hierarchy
    toCreate.push([
      resourceHierarchy[resourceHierarchy.length - 1],
      newResource,
    ]);
  } else {
    // There is a resource wrapped by our new one
    toCreate.push([newResource, wrappedResource]);
    // Now check if that resource was inside another, so we undo that relationship and put our new
    // resource in the middle
    const wrappedIndex = resourceHierarchy.indexOf(wrappedResource);
    const resourceBeforeWrapped = resourceHierarchy[wrappedIndex - 1];
    if (resourceBeforeWrapped) {
      toRemove.push([resourceBeforeWrapped, wrappedResource]);
      toCreate.push([resourceBeforeWrapped, newResource]);
    }
  }

  return { toCreate, toRemove };
}

export default wrapStructureContent;
