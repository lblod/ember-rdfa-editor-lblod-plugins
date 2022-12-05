import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';

export default class RdfaDatePlugin extends RdfaEditorPlugin {
  widgets(): WidgetSpec[] {
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
