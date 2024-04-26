import {
  Command,
  Fragment,
  NodeSelection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import wrapStructureContent from './wrap-structure-content';
import IntlService from 'ember-intl/services/intl';
import { findInsertionRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/_private/find-insertion-range';

const insertStructure = (
  structureSpec: StructureSpec,
  intl: IntlService,
  content?: Fragment,
): Command => {
  return (state, dispatch) => {
    const { schema, selection, doc } = state;
    if (
      !content &&
      wrapStructureContent(structureSpec, intl)(state, dispatch)
    ) {
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
      const { node: newStructureNode, selectionConfig } =
        structureSpec.constructor({ schema, intl, content, state });
      const transaction = state.tr;

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
      dispatch(transaction);
    }
    return true;
  };
};

export default insertStructure;
