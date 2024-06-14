import { Command, EditorState, Transaction } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { v4 as uuid } from 'uuid';
import { addPropertyToNode } from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';

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
    const { schema } = state;
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
    const tr = state.tr;
    tr.replaceSelectionWith(nodeToInsert);
    const factory = new SayDataFactory();

    const { transaction: newTr, result } = transactionCombinator<boolean>(
      state,
      tr,
    )([
      addPropertyToNode({
        resource: decisionNode.node.attrs.subject,
        property: {
          predicate: BESLUIT('motivering').full,
          object: factory.literalNode(motivationId),
        },
      }),
    ]);
    if (result.some((success) => !success)) {
      return false;
    }
    if (dispatch) {
      dispatch(newTr);
    }
    return true;
  };
}
