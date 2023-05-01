import { Command } from '@lblod/ember-rdfa-editor';

export function insertBaseTitle(): Command {
  console.log('insert Title');
  return function (state, dispatch) {
    const { schema, selection } = state;
    //let { $from } = selection;
    //let index = $from.index();
    // if (!$from.parent.canReplaceWith(index, index, 'structure-title')){
    //   console.log("can't insert")
    //   return false;
    // }
    if (dispatch) {
      console.log('dispatch');
      dispatch(
        state.tr.replaceSelectionWith(
          schema.node('structure_title', { text: 'Hoofdtitel' })
        )
      );
    }
    return true;
  };
}
