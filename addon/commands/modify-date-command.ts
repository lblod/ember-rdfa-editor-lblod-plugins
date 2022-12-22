import { Command, Mark } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

function formatDate(date: Date, onlyDate: boolean) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(!onlyDate && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  return date.toLocaleString('nl-BE', options);
}

export default function modifyDate(
  from: number,
  to: number,
  dateValue: Date,
  onlyDate: boolean
): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const transaction = state.tr;
      const node = unwrap(transaction.doc.nodeAt(from));
      const currentRdfaMark = node.marks
        .filter((mark) => mark.type.name === 'inline_rdfa')
        .at(-1);
      if (currentRdfaMark) {
        transaction.removeMark(from, to, currentRdfaMark);
      }

      const newMark: Mark = currentRdfaMark
        ? state.schema.mark('inline_rdfa', {
            ...currentRdfaMark.attrs,
            content: dateValue.toISOString(),
          })
        : state.schema.mark('inline_rdfa', {
            content: dateValue.toISOString(),
          });
      transaction.addMark(from, to, newMark);
      transaction.insertText(formatDate(dateValue, onlyDate), from, to);
      dispatch(transaction);
    }
    return true;
  };
}
