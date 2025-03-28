import { Command, EditorState, Transaction } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuid } from 'uuid';
import { addPropertyToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { PROV } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { buildArticleStructure } from '../utils/build-article-structure';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { insertArticle } from '../actions/insert-article';
import { recalculateNumbers } from '../../structure-plugin/monads/recalculate-structure-numbers';

interface InsertArticleContainerArgs {
  intl: IntlService;
  decisionUri: string;
  articleUriGenerator?: () => string;
}

export default function insertArticleContainer({
  decisionUri,
  articleUriGenerator,
}: InsertArticleContainerArgs): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { schema } = state;
    const articleContainerId = uuid();
    const containerNode = schema.nodes.block_rdfa.create(
      {
        rdfaNodeType: 'literal',
        __rdfaId: articleContainerId,
      },
      schema.nodes.paragraph.create(),
    );

    const articleNode = buildArticleStructure(schema, articleUriGenerator);

    const factory = new SayDataFactory();
    const { transaction: newTr, result } = transactionCombinator<boolean>(
      state,
      state.tr.replaceSelectionWith(containerNode),
    )([
      addPropertyToNode({
        resource: decisionUri,
        property: {
          predicate: PROV('value').full,
          object: factory.literalNode(articleContainerId),
        },
      }),
      insertArticle({
        node: articleNode,
        decisionUri,
      }),
      recalculateNumbers,
    ]);
    if (dispatch && result.every((ok) => ok)) {
      dispatch(newTr.scrollIntoView());
    }
    return true;
  };
}
