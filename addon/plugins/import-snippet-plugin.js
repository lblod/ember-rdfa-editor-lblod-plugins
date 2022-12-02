export default class ImportSnippetPlugin {
  controller;

  get name() {
    return 'import-snippet-plugin';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'import-snippet-plugin/card',
      identifier: 'import-snippet-plugin/card',
      desiredLocation: 'sidebar',
    });
  }
}
