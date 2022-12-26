import { EditorState, Schema, Transaction } from '@lblod/ember-rdfa-editor';
import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
} from '../utils';
import { v4 as uuid } from 'uuid';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

export const subsectionSpec: StructureSpec = {
  name: 'subsection',
  context: ['section_body'],
  continuous: false,
  constructor: (schema: Schema, number: number) => {
    const numberConverted = romanize(number);
    const node = schema.node(
      `subsection`,
      { resource: `http://data.lblod.info/subsections/${uuid()}` },
      [
        schema.node(
          'structure_header',
          { level: 4, number: numberConverted },
          schema.node('placeholder', {
            placeholderText: 'Insert subsection title',
          })
        ),
        schema.node(`subsection_body`, {}, [
          schema.node(
            'paragraph',
            {},
            schema.node('placeholder', {
              placeholderText: 'Insert subsection content',
            })
          ),
        ]),
      ]
    );
    return node;
  },
  updateNumber: (number: number, pos: number, transaction: Transaction) => {
    const numberConverted = romanize(number);
    return transaction.setNodeAttribute(pos + 1, 'number', numberConverted);
  },
  content: (pos: number, state: EditorState) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return node.child(1).content;
  },
};

export const subsection = constructStructureNodeSpec({
  type: 'https://say.data.gift/ns/Subsection',
  content: 'structure_header subsection_body',
});

export const subsection_body = constructStructureBodyNodeSpec({
  content: 'paragraph+',
});
