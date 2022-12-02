function formatDate(date, onlyDate) {
  let options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  if (onlyDate) {
    options.hour = undefined;
    options.minute = undefined;
  }
  return date.toLocaleString('nl-BE', options);
}

export default function modifyDate(from, to, dateValue, onlyDate) {
  return function (state, dispatch) {
    if (dispatch) {
      console.log('FROM: ', from);
      console.log('TO: ', to);
      console.log('DATE: ', dateValue.toISOString());
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
