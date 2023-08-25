import { Command, DOMParser as ProseParser } from '@lblod/ember-rdfa-editor';

export const insertGenericRdfa = (editorContent: string): Command => {
  return (state, dispatch) => {
    const { schema, tr } = state;

    const domParser = new DOMParser();

    tr.replaceSelectionWith(
      ProseParser.fromSchema(schema).parse(
        domParser.parseFromString(editorContent, 'text/html'),
      ),
    );

    if (!tr.docChanged) {
      return false;
    }

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  };
};
