/**
 * Entrypoint for the roadsign regulation plugin.
 */
export default class RoadSignRegulationPlugin {
  controller;

  get name() {
    return 'roadsign-regulation-plugin';
  }

  /**
   * Gets called when the editor loads.
   * Can optionally be async if needed.
   * @param controller
   */
  initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'roadsign-regulation-plugin/roadsign-regulation-card',
      identifier: 'roadsign-regulation-plugin/roadsign-regulation-card',
      desiredLocation: 'insertSidebar',
    });
  }
}
