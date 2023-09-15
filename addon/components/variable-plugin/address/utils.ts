import { SayController, NodeSelection } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';

export function replaceSelectionWithAddress(
  controller: SayController,
  label: string,
) {
  const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
  const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
  controller.withTransaction((tr) => {
    tr.replaceSelectionWith(
      controller.schema.node('address', {
        label: label,
        mappingResource,
        variableInstance,
      }),
    );
    if (tr.selection.$anchor.nodeBefore) {
      const resolvedPos = tr.doc.resolve(
        tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
      );
      tr.setSelection(new NodeSelection(resolvedPos));
    }
    return tr;
  });
}
