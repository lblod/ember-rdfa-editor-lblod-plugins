export default class InsertVariablePlugin {
  controller;

  get name() {
    return 'insert-variable-plugin';
  }

  initialize(controller, options) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'insert-variable-plugin/insert-variable-card',
      identifier: 'insert-variable-plugin/card',
      desiredLocation: 'sidebar',
      widgetArgs: {
        options: options,
      },
    });
  }
}
