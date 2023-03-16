import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { Command } from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import { validateTransaction } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';

export default function insertDescription(): Command {
  return function (state, dispatch) {
    const { selection, schema } = state;
    const { $from, $to } = selection;
    const decision = findParentNodeOfType(schema.nodes.besluit)(selection);
    if (!decision) {
      return false;
    }
    const insertionIndex = $from.indexAfter(decision.depth);
    const insertionPos = $from.posAtIndex(insertionIndex, decision.depth);
    if (
      !decision.node.canReplaceWith(
        insertionIndex,
        insertionIndex,
        schema.nodes.description
      )
    ) {
      console.log('cannot replace');
      return false;
    }
    const tr = state.tr;
    // tr.insertText("test", insertionPos, insertionPos);
    tr.replaceRangeWith(
      insertionPos,
      insertionPos,
      schema.node(
        'description',
        { __rdfaId: uuid() },
        schema.node(
          'paragraph',
          null,
          schema.node('placeholder', {
            placeholderText: 'Description',
          })
        )
      )
    );
    const valid = validateTransaction(state, tr).conforms;
    // if (!valid) {
    //   return false;
    // }
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  };
}
