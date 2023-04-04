import {
  Command,
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import { besluitArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin/utils/nodes';
import IntlService from 'ember-intl/services/intl';
import { isNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCompliesWithShapes } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation/utils/transaction-complies-with-shapes';
import { findInsertionPosInAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/find-insertion-pos-in-ancestor-of-type';

interface InsertArticleContainerArgs {
  intl: IntlService;
  validateShapes?: Set<string>;
}

export default function insertArticleContainer({
  intl,
  validateShapes,
}: InsertArticleContainerArgs): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { selection, schema } = state;
    const nodeToInsert = schema.node(
      'article_container',
      {
        __rdfaId: uuid(),
      },
      besluitArticleStructure.constructor({
        schema,
        intl,
      }).node
    );

    const insertionPos = findInsertionPosInAncestorOfType(
      selection,
      schema.nodes.besluit,
      nodeToInsert
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
      tr.setSelection(NodeSelection.create(tr.doc, insertionPos + 4));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}
