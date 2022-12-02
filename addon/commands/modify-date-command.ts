import { Command } from 'prosemirror-state';

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
      transaction.setNodeAttribute(
        from - 1,
        'content',
        dateValue.toISOString()
      );
      transaction.insertText(formatDate(dateValue, onlyDate), from, to);
      dispatch(transaction);
    }
    return true;
  };
}
