import { SayController, NodeSelection } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * @deprecated
 */
export function replaceSelectionWithAddress(
  controller: SayController,
  label?: string,
  templateMode?: boolean,
) {
  const mappingResource = `http://data.lblod.info/mappings/${
    templateMode ? '--ref-uuid4-' : ''
  }${uuidv4()}`;
  const variableInstance = `http://data.lblod.info/variables/${
    templateMode ? '--ref-uuid4-' : ''
  }${uuidv4()}`;

  controller.withTransaction((tr) => {
    tr.replaceSelectionWith(
      controller.schema.node('address', {
        subject: mappingResource,
        rdfaNodeType: 'resource',
        __rdfaId: uuidv4(),
        properties: [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(variableInstance),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('address'),
          },
          {
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label || ''),
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
