import { Command } from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';

interface InsertDocumentTitleArgs {
  placeholder: string;
}
export default function insertDocumentTitle({
  placeholder,
}: InsertDocumentTitleArgs): Command {
  return function (state, dispatch) {
    const { schema, selection } = state;
    if (
      !state.doc.canReplaceWith(
        selection.$from.index(0),
        selection.$from.index(0),
        schema.nodes.document_title
      )
    ) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr;
      tr.insert(
        selection.from - 1,
        schema.node(
          'document_title',
          { __rdfaId: uuid() },
          schema.node(
            'paragraph',
            null,
            schema.node('placeholder', {
              placeholderText: placeholder,
            })
          )
        )
      );
      dispatch(tr);
    }

    return true;
  };
}
