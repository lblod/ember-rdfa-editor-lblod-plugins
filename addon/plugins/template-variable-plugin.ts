import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
export default class TemplateVariablePlugin extends RdfaEditorPlugin {
  widgets(): WidgetSpec[] {
    return [
      {
        componentName: 'template-variable-plugin/template-variable-card',
        desiredLocation: 'sidebar',
      },
    ];
  }
}
