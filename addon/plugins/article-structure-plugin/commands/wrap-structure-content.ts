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
import { addProperty } from '@lblod/ember-rdfa-editor/commands';
import {
  SpecConstructorResult,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import IntlService from 'ember-intl/services/intl';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

const wrapStructureContent = (
  structureSpec: StructureSpec,
  intl: IntlService,
): Command => {
  return (state, dispatch) => {
    if (!structureSpec.content) {
      return false;
    }
    const { selection, schema } = state;
    const [container, resource] = findInsertionContainer(
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

      if (resource) {
        const newState = state.apply(transaction);
        addProperty({
          resource: newResource,
          property: {
            type: 'external',
            predicate: (structureSpec.relationshipPredicate ?? SAY('hasPart'))
              .prefixed,
            object: {
              type: 'resource',
              resource,
            },
          },
          transaction,
        })(newState, (newTransaction) => {
          transaction = newTransaction;
        });
      }
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
): [ContainerNode | null, string | undefined] {
  const { $from } = selection;
  let container: ContainerNode | null = null;
  let resource: string | undefined;
  // Loop from current depth to top looking for a container and resource URI
  for (let currentDepth = $from.depth; currentDepth >= 0; currentDepth--) {
    const currentAncestor = $from.node(currentDepth);
    if (!resource) {
      resource = currentAncestor.attrs?.resource as string | undefined;
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
  return [container, resource];
}

export default wrapStructureContent;
