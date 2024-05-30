import {
  Command,
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { isNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';
import IntlService from 'ember-intl/services/intl';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { IncomingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { v4 as uuid } from 'uuid';
import { addProperty } from '@lblod/ember-rdfa-editor/commands';
import {
  addPropertyToNode,
  findRdfaIdsInSelection,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';

interface InsertMotivationArgs {
  intl: IntlService;
  decisionLocation: NodeWithPos;
}

export default function insertMotivation({
  intl,
  decisionLocation,
}: InsertMotivationArgs): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const translationWithDocLang = getTranslationFunction(state);
    const { selection, schema } = state;
    const decisionNode = decisionLocation;
    const motivationId = uuid();
    const nodeToInsert = schema.node(
      'block_rdfa',
      { rdfaNodeType: 'literal', __rdfaId: motivationId },
      [
        schema.node(
          'paragraph',
          null,
          schema.node('placeholder', {
            placeholderText: translationWithDocLang(
              'besluit-plugin.placeholder.government-body',
              intl.t('besluit-plugin.placeholder.government-body'),
            ),
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
                placeholderText: translationWithDocLang(
                  'besluit-plugin.placeholder.legal-jurisdiction',
                  intl.t('besluit-plugin.placeholder.legal-jurisdiction'),
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
          [
            schema.text(
              translationWithDocLang(
                'besluit-plugin.text.legal-context',
                intl.t('besluit-plugin.text.legal-context'),
              ),
            ),
          ],
        ),
        schema.node('bullet_list', null, [
          schema.node('list_item', null, [
            schema.node('paragraph', null, [
              schema.node('placeholder', {
                placeholderText: translationWithDocLang(
                  'besluit-plugin.placeholder.insert-legal-context',
                  intl.t('besluit-plugin.placeholder.insert-legal-context'),
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
          [
            schema.text(
              translationWithDocLang(
                'besluit-plugin.text.factual-context',
                intl.t('besluit-plugin.text.factual-context'),
              ),
            ),
          ],
        ),
        schema.node('bullet_list', null, [
          schema.node('list_item', null, [
            schema.node('paragraph', null, [
              schema.node('placeholder', {
                placeholderText: translationWithDocLang(
                  'besluit-plugin.placeholder.insert-factual-context',
                  intl.t('besluit-plugin.placeholder.insert-factual-context'),
                ),
              }),
            ]),
          ]),
        ]),
      ],
    );
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
    const { transaction: newTr, result } = transactionCombinator<boolean>(
      state,
      tr,
    )([
      addPropertyToNode({
        resource: decisionNode.node.attrs.subject,
        property: {
          predicate: BESLUIT('motivering').full,
          object: { termType: 'LiteralNode', value: motivationId },
        },
      }),
    ]);
    if (result.some((success) => !success)) {
      return false;
    }
    if (dispatch) {
      const selectionPos = newTr.doc.resolve(insertionPos + cursorOffset);
      // const targetPos = tr.doc.resolve(insertionPos + cursorOffset + 1);
      // TODO figure out why I cant just set a nodeSelection here
      newTr.setSelection(
        new NodeSelection(newTr.doc.resolve(selectionPos.posAtIndex(0))),
      );
      dispatch(newTr);
    }
    return true;
  };
}
