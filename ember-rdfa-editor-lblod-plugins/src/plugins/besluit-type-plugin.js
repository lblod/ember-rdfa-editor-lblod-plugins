export default class BesluitTypePlugin {
  controller;

  get name() {
    return 'besluit-type';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'besluit-type-plugin/toolbar-dropdown',
      identifier: 'besluit-type-plugin/dropdown',
      desiredLocation: 'toolbar',
    });
  }
}
