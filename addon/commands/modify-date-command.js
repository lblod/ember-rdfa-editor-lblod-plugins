export default class ModifyDateCommand {
  name = 'modify-date';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, element, dateValue, onlyDate) {
    this.model.change((mutator) => {
      const range = controller.rangeFactory.fromInElement(
        element,
        0,
        element.getMaxOffset()
      );
      mutator.insertText(
        range,
        this.formatDate(dateValue, onlyDate),
        range.getMarks()
      );
      element.attributeMap.set('content', dateValue.toISOString());
    });
  }

  formatDate(date, onlyDate) {
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
}
