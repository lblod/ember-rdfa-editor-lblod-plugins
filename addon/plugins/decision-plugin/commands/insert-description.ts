import { Schema } from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import insertNodeIntoAncestorAtPoint from '@lblod/ember-rdfa-editor-lblod-plugins/utils/insert-block-into-node';

interface InsertDescriptionArgs {
  placeholderText: string;
  validateShapes?: Set<string>;
}

export default function insertDescription({
  placeholderText,
  validateShapes,
}: InsertDescriptionArgs) {
  return insertNodeIntoAncestorAtPoint({
    validateShapes,
    ancestorType(schema: Schema) {
      return schema.nodes.besluit;
    },
    nodeToInsert(schema: Schema) {
      return schema.node(
        'description',
        { __rdfaId: uuid() },
        schema.node(
          'paragraph',
          null,
          schema.node('placeholder', {
            placeholderText,
          })
        )
      );
    },
  });
}
