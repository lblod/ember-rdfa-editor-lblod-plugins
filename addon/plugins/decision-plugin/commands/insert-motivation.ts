import { Command, Schema } from '@lblod/ember-rdfa-editor';
import insertNodeIntoAncestorAtPoint from '../../../utils/insert-block-into-node';
import { v4 as uuid } from 'uuid';

interface InsertMotivationArgs {
  validateShapes?: Set<string>;
}

export default function insertMotivation({
  validateShapes,
}: InsertMotivationArgs = {}): Command {
  return insertNodeIntoAncestorAtPoint({
    validateShapes,
    ancestorType(schema: Schema) {
      return schema.nodes.besluit;
    },
    nodeToInsert(schema: Schema) {
      return schema.node('motivering', { __rdfaId: uuid() }, [
        schema.node('heading', { level: 5 }, schema.text('Bevoegdheid')),
        schema.node(
          'paragraph',
          null,
          schema.node('placeholder', {
            placeholderText: 'motivation',
          })
        ),
      ]);
    },
  });
}
