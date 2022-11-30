import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';

export default class RdfaDatePlugin extends RdfaEditorPlugin {
  widgets() {
    return [
      {
        componentName: 'rdfa-date-plugin/card',
        desiredLocation: 'sidebar',
      },
      {
        componentName: 'rdfa-date-plugin/insert',
        desiredLocation: 'insertSidebar',
      },
    ];
  }
}
