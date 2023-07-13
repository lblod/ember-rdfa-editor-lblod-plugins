import {
  Command,
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import { isNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCompliesWithShapes } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation/utils/transaction-complies-with-shapes';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';
import IntlService from 'ember-intl/services/intl';

interface InsertMotivationArgs {
  intl: IntlService;
  validateShapes?: Set<string>;
}

export default function insertMotivation({
  intl,
  validateShapes,
}: InsertMotivationArgs): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { selection, schema } = state;
    const nodeToInsert = schema.node('motivering', { __rdfaId: uuid() }, [
      schema.node(
        'paragraph',
        null,
        schema.node('placeholder', {
          placeholderText: intl.t('besluit-plugin.placeholder.government-body'),
        }),
      ),
      schema.node(
        'heading',
        {
          level: 5,
        },
        [schema.text(intl.t('besluit-plugin.text.authority'))],
      ),
      schema.node('bullet_list', null, [
        schema.node('list_item', null, [
          schema.node('paragraph', null, [
            schema.node('placeholder', {
              placeholderText: intl.t(
                'besluit-plugin.placeholder.legal-jurisdiction',
              ),
            }),
          ]),
        ]),
      ]),
      schema.node(
        'heading',
        {
          level: 5,
        },
        [schema.text(intl.t('besluit-plugin.text.legal-context'))],
      ),
      schema.node('bullet_list', null, [
        schema.node('list_item', null, [
          schema.node('paragraph', null, [
            schema.node('placeholder', {
              placeholderText: intl.t(
                'besluit-plugin.placeholder.insert-legal-context',
              ),
            }),
          ]),
        ]),
      ]),
      schema.node(
        'heading',
        {
          level: 5,
        },
        [schema.text(intl.t('besluit-plugin.text.factual-context'))],
      ),
      schema.node('bullet_list', null, [
        schema.node('list_item', null, [
          schema.node('paragraph', null, [
            schema.node('placeholder', {
              placeholderText: intl.t(
                'besluit-plugin.placeholder.insert-factual-context',
              ),
            }),
          ]),
        ]),
      ]),
    ]);
    // how the offset between the insertion point and the point where the cursor should end up
    const cursorOffset = 2;

    const insertionPos = findInsertionPosInAncestorOfType(
      selection,
      schema.nodes.besluit,
      nodeToInsert,
    );
    if (isNone(insertionPos)) {
      return false;
    }
    const tr = state.tr;

    tr.replaceRangeWith(insertionPos, insertionPos, nodeToInsert);
    if (!transactionCompliesWithShapes(state, tr, validateShapes)) {
      return false;
    }
    if (dispatch) {
      const selectionPos = tr.doc.resolve(insertionPos + cursorOffset);
      // const targetPos = tr.doc.resolve(insertionPos + cursorOffset + 1);
      // TODO figure out why I cant just set a nodeSelection here
      tr.setSelection(
        new NodeSelection(tr.doc.resolve(selectionPos.posAtIndex(0))),
      );
      dispatch(tr);
    }
    return true;
  };
}
