import ModifyDateCommand from '../commands/modify-date-command';

export default class RdfaDatePlugin {
  controller;

  get name() {
    return 'rdfa-date-plugin';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'rdfa-date-plugin/rdfa-date-plugin-card',
      identifier: 'rdfa-date-plugin/card',
      desiredLocation: 'sidebar',
    });
    controller.registerWidget({
      componentName: 'rdfa-date-plugin/rdfa-date-plugin-insert',
      identifier: 'rdfa-date-plugin/insert',
      desiredLocation: 'insertSidebar',
    });
    controller.registerCommand(
      new ModifyDateCommand(controller._rawEditor._model)
    );
  }
}
