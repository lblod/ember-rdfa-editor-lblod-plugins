import { SayController, NodeSelection } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { v4 as uuidv4 } from 'uuid';

export function replaceSelectionWithAddress(
  controller: SayController,
  label?: string,
) {
  const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
  const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;

  controller.withTransaction((tr) => {
    tr.replaceSelectionWith(
      controller.schema.node('address', {
        subject: mappingResource,
        rdfaNodeType: 'resource',
        __rdfaId: uuidv4(),
        properties: [
          {
            type: 'attribute',
            predicate: RDF('type').full,
            object: EXT('Mapping').full,
          },
          {
            type: 'attribute',
            predicate: EXT('instance').full,
            object: variableInstance,
          },
          {
            type: 'attribute',
            predicate: DCT('type').full,
            object: 'address',
          },
          {
            type: 'attribute',
            predicate: EXT('label').full,
            object: label,
          },
        ],
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
