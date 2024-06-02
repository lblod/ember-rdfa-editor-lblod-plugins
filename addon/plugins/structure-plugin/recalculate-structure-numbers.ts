import { EditorState } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { TransactionResult } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';

export function recalculateNumbers(
  state: EditorState,
): TransactionResult<boolean> {
  const tr = state.tr;
  const doc = tr.doc;
  let counter = 0;
  doc.descendants((node, pos) => {
    if (
      node.type.name === 'structure' &&
      hasOutgoingNamedNodeTriple(node.attrs, RDF('type'), BESLUIT('Artikel'))
    ) {
      counter += 1;
      if (counter !== Number(node.attrs.number)) {
        tr.setNodeAttribute(pos, 'number', counter);
      }
    }
    return true;
  });
  return { transaction: tr, result: true, initialState: state };
}
