import { Command } from '@lblod/ember-rdfa-editor';
import { findInsertionRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/_private/find-insertion-range';

interface InsertDocumentTitleArgs {
  placeholder: string;
}
export default function insertDocumentTitle({
  placeholder,
}: InsertDocumentTitleArgs): Command {
  return function (state, dispatch) {
    const { schema } = state;
    const insertionRange = findInsertionRange({
      doc: state.doc,
      $from: state.doc.resolve(0),
      nodeType: schema.nodes.document_title,
      schema,
    });
    if (!insertionRange) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr;
      tr.replaceWith(
        insertionRange.from,
        insertionRange.to,
        schema.node(
          'document_title',
          {},
          schema.node(
            'paragraph',
            null,
            schema.node('placeholder', {
              placeholderText: placeholder,
            }),
          ),
        ),
      );
      dispatch(tr);
    }

    return true;
  };
}
