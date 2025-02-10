import { EditorState } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import type { TransactionMonadResult } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { STRUCTURE_HIERARCHY } from './structure-types';

export function recalculateNumbers(
  state: EditorState,
): TransactionMonadResult<boolean> {
  const tr = state.tr;
  const doc = tr.doc;
  STRUCTURE_HIERARCHY.map(({ rdfType }) => rdfType)
    .concat(BESLUIT('Artikel'))
    .forEach((rdfType) => {
      let counter = 0;
      let lastNodePos;
      doc.descendants((node, pos) => {
        if (
          node.type.name === 'structure' &&
          hasOutgoingNamedNodeTriple(node.attrs, RDF('type'), rdfType)
        ) {
          counter += 1;
          lastNodePos = pos;
          if (node.attrs.isOnlyArticle === true) {
            tr.setNodeAttribute(pos, 'isOnlyArticle', false);
          }
          if (counter !== Number(node.attrs.number)) {
            tr.setNodeAttribute(pos, 'number', counter);
          }
        }
        return true;
      });
      if (
        BESLUIT('Artikel').matches(rdfType.full) &&
        lastNodePos !== undefined &&
        counter === 1
      ) {
        tr.setNodeAttribute(lastNodePos, 'isOnlyArticle', true);
      }
    });
  return { transaction: tr, result: true, initialState: state };
}
