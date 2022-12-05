import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';

export default class BesluitTypePlugin extends RdfaEditorPlugin {
  widgets(): WidgetSpec[] {
    return [
      {
        componentName: 'besluit-type-plugin/toolbar-dropdown',
        desiredLocation: 'toolbarRight',
      },
    ];
  }
}
