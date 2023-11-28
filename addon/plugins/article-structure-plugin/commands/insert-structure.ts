import {
  Command,
  Fragment,
  NodeSelection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { addProperty } from '@lblod/ember-rdfa-editor/commands';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import wrapStructureContent from './wrap-structure-content';
import IntlService from 'ember-intl/services/intl';
import { findInsertionRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/_private/find-insertion-range';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { Backlink } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

const wrappingResources = [SAY('body').prefixed, SAY('body').full];

const insertStructure = (
  structureSpec: StructureSpec,
  intl: IntlService,
  content?: Fragment,
): Command => {
  return (state, dispatch) => {
    const { schema, selection, doc } = state;
    if (wrapStructureContent(structureSpec, intl)(state, dispatch)) {
      return true;
    }
    const insertionRange = findInsertionRange({
      doc,
      $from: selection.$from,
      nodeType: schema.nodes[structureSpec.name],
      schema,
      limitTo: structureSpec.limitTo,
    });
    if (!insertionRange) {
      return false;
    }
    if (dispatch) {
      const backlinks = insertionRange.containerNode.attrs?.backlinks as
        | Backlink[]
        | undefined;
      const resource = backlinks?.find((backlink) =>
        wrappingResources.includes(backlink.predicate),
      )?.subject;
      const {
        node: newStructureNode,
        selectionConfig,
        newResource,
      } = structureSpec.constructor({ schema, intl, content, state });
      let transaction = state.tr;

      transaction.replaceWith(
        insertionRange.from,
        insertionRange.to,
        newStructureNode,
      );
      const newSelection =
        selectionConfig.type === 'node'
          ? NodeSelection.create(
              transaction.doc,
              insertionRange.from + selectionConfig.relativePos,
            )
          : TextSelection.create(
              transaction.doc,
              insertionRange.from + selectionConfig.relativePos,
            );
      transaction.setSelection(newSelection);
      transaction.scrollIntoView();
      recalculateStructureNumbers(transaction, structureSpec);

      if (resource) {
        const newState = state.apply(transaction);
        addProperty({
          resource,
          property: {
            type: 'external',
            predicate: SAY('hasPart').prefixed,
            object: {
              type: 'resource',
              resource: newResource,
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

export default insertStructure;
