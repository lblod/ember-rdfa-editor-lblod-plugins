import { Command, EditorState, Transaction } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuid } from 'uuid';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { addPropertyToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { PROV } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { buildArticleStructure } from '../utils/build-article-structure';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { recalculateNumbers } from '../../structure-plugin/monads/recalculate-structure-numbers';

interface InsertArticleContainerArgs {
  intl: IntlService;
  decisionLocation: NodeWithPos;
  articleUriGenerator?: () => string;
}

export default function insertArticleContainer({
  decisionLocation,
  articleUriGenerator,
}: InsertArticleContainerArgs): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { schema } = state;
    const articleContainerId = uuid();
    const nodeToInsert = schema.node(
      'block_rdfa',
      { rdfaNodeType: 'literal', __rdfaId: articleContainerId },
      buildArticleStructure(
        schema,
        articleUriGenerator,
        decisionLocation.node.attrs.subject,
      ),
    );

    const tr = state.tr;
    tr.replaceSelectionWith(nodeToInsert);

    const factory = new SayDataFactory();
    const { transaction: newTr, result } = transactionCombinator<boolean>(
      state,
      tr,
    )([
      addPropertyToNode({
        resource: decisionLocation.node.attrs.subject,
        property: {
          predicate: PROV('value').full,
          object: factory.literalNode(articleContainerId),
        },
      }),
      recalculateNumbers,
    ]);
    if (dispatch && result.every((ok) => ok)) {
      dispatch(newTr.scrollIntoView());
    }
    return true;
  };
}
