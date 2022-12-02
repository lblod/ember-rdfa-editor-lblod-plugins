import InsertAndCollapseCommand from '../commands/insert-and-collapse';

export default class TemplateVariablePlugin {
  controller;

  get name() {
    return 'template-variable-plugin';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'template-variable-plugin/template-variable-card',
      identifier: 'template-variable-plugin/card',
      desiredLocation: 'sidebar',
    });
    controller.registerCommand(
      new InsertAndCollapseCommand(controller._rawEditor._model)
    );
  }
}
