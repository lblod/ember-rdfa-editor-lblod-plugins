import {
  Command,
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { besluitArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin/utils/nodes';
import IntlService from 'ember-intl/services/intl';
import {
  isNone,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCompliesWithShapes } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation/utils/transaction-complies-with-shapes';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';
import { v4 as uuid } from 'uuid';
import { findInsertionPosInNode } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-node';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import {
  addPropertyToNode,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import {
  BESLUIT,
  PROV,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

interface InsertArticleContainerArgs {
  intl: IntlService;
  decisionLocation: NodeWithPos;
}

export default function insertArticleContainer({
  intl,
  decisionLocation,
}: InsertArticleContainerArgs): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { selection, schema } = state;
    const articleContainerId = uuid();
    const nodeToInsert = schema.node(
      'block_rdfa',
      { rdfaNodeType: 'literal', __rdfaId: articleContainerId },
      schema.node('structure', {}, schema.node('paragraph')),
    );

    const tr = state.tr;
    tr.replaceSelectionWith(nodeToInsert);

    const { transaction: newTr, result } = transactionCombinator<boolean>(
      state,
      tr,
    )([
      addPropertyToNode({
        resource: decisionLocation.node.attrs.subject,
        property: {
          predicate: PROV('value').full,
          object: { termType: 'LiteralNode', value: articleContainerId },
        },
      }),
    ]);
    if (dispatch && result.every((ok) => ok)) {
      dispatch(newTr.scrollIntoView());
    }
    return true;
  };
}
