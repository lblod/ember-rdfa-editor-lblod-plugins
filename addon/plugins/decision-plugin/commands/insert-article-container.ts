import { Command, EditorState, Transaction } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuid } from 'uuid';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import {
  addPropertyToNode,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { PROV } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { buildArticleStructure } from '../../structure-plugin/node';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

interface InsertArticleContainerArgs {
  intl: IntlService;
  decisionLocation: NodeWithPos;
}

export default function insertArticleContainer({
  decisionLocation,
}: InsertArticleContainerArgs): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { schema } = state;
    const articleContainerId = uuid();
    const nodeToInsert = schema.node(
      'block_rdfa',
      { rdfaNodeType: 'literal', __rdfaId: articleContainerId },
      buildArticleStructure(schema),
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
    ]);
    if (dispatch && result.every((ok) => ok)) {
      dispatch(newTr.scrollIntoView());
    }
    return true;
  };
}
