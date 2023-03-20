import { Schema } from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import insertNodeIntoAncestorAtPoint from '@lblod/ember-rdfa-editor-lblod-plugins/utils/insert-block-into-node';

export default function insertDescription(placeholderText: string) {
  return insertNodeIntoAncestorAtPoint({
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
