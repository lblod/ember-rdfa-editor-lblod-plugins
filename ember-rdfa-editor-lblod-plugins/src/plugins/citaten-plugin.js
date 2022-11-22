import CitatenMark from '../marks/citaten-mark';
export default class CitatenPlugin {
  controller;

  get name() {
    return 'citaten';
  }
  async initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      desiredLocation: 'sidebar',
      componentName: 'citaten-plugin/citaat-card',
      identifier: 'citaten-plugin/citaat-card',
    });
    controller.registerWidget({
      desiredLocation: 'insertSidebar',
      componentName: 'citaten-plugin/citaat-insert',
      identifier: 'citaten-plugin/citaat-insert',
    });
    controller.registerMark(CitatenMark);
  }
}
