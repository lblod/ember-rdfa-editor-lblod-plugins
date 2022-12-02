import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
export default class ImportSnippetPlugin extends RdfaEditorPlugin {
  widgets(): WidgetSpec[] {
    return [
      {
        componentName: 'import-snippet-plugin/card',
        desiredLocation: 'sidebar',
      },
    ];
  }
}
