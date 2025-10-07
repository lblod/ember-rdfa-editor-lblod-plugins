import { EditorState } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import type { TransactionMonadResult } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { DECISION_ARTICLE, STRUCTURE_HIERARCHY } from '../structure-types';

export function recalculateNumbers(
  state: EditorState,
): TransactionMonadResult<boolean> {
  const tr = state.tr;
  const doc = tr.doc;
  STRUCTURE_HIERARCHY.concat(DECISION_ARTICLE).forEach(
    ({ rdfType, absoluteNumbering }) => {
      let counter = 0;
      let lastNodePos;
      doc.descendants((node, pos) => {
        if (node.type.name === 'structure') {
          if (hasOutgoingNamedNodeTriple(node.attrs, RDF('type'), rdfType)) {
            const startNumber = node.attrs.startNumber;
            if (startNumber) {
              counter = startNumber;
            } else {
              counter += 1;
            }
            lastNodePos = pos;
            if (node.attrs.isOnlyArticle === true) {
              tr.setNodeAttribute(pos, 'isOnlyArticle', false);
            }
            if (counter !== Number(node.attrs.number)) {
              tr.setNodeAttribute(pos, 'number', counter);
            }
            // structures can't contain themselves
            return false;
          } else if (!absoluteNumbering) {
            // Found a different structure so reset counter
            counter = 0;
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
    },
  );
  if (tr.docChanged) {
    tr.setSelection(state.selection.getBookmark().resolve(tr.doc));
  }
  return { transaction: tr, result: true, initialState: state };
}
