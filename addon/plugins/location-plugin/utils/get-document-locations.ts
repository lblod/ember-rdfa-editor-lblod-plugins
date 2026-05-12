import { SayController } from '@lblod/ember-rdfa-editor';

export default function getDocumentLocations(controller: SayController) {
  const state = controller.mainEditorState;
  const doc = state.doc;
  const locations: (Place | Address | Area)[] = [];
  doc.descendants((node) => {
    if (node.type.name === 'oslo_location') {
      locations.push(node.attrs.value);
      return false;
    }
    return true;
  });
  return locations;
}
