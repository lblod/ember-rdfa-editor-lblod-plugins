import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';
/**
 * Entrypoint for the roadsign regulation plugin.
 */
export default class RoadSignRegulationPlugin extends RdfaEditorPlugin {
  widgets() {
    return [
      {
        componentName: 'roadsign-regulation-plugin/roadsign-regulation-card',
        desiredLocation: 'insertSidebar',
      },
    ];
  }
}
