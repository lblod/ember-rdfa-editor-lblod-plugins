import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';

export default class BesluitTypePlugin extends RdfaEditorPlugin {
  widgets() {
    return [
      {
        componentName: 'besluit-type-plugin/toolbar-dropdown',
        identifier: 'besluit-type-plugin/dropdown',
        desiredLocation: 'toolbarRight',
      },
    ];
  }
}
