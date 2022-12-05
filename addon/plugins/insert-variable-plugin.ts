import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
export default class InsertVariablePlugin extends RdfaEditorPlugin {
  widgets(): WidgetSpec[] {
    return [
      {
        componentName: 'insert-variable-plugin/insert-variable-card',
        desiredLocation: 'sidebar',
        widgetArgs: {
          options: this.options,
        },
      },
    ];
  }
}
