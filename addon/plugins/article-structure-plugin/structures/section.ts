import { EditorState, Schema, Transaction } from '@lblod/ember-rdfa-editor';
import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
} from '../utils';
import { v4 as uuid } from 'uuid';
import { StructureSpec } from '..';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

export const sectionSpec: StructureSpec = {
  name: 'section',
  context: ['chapter_body'],
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.section',
    move: {
      up: 'article-structure-plugin.moveUp.section',
      down: 'article-structure-plugin.moveDown.section',
    },
    remove: '',
  },
  constructor: (schema: Schema, number: number) => {
    const numberConverted = romanize(number);
    const node = schema.node(
      `section`,
      { resource: `http://data.lblod.info/sections/${uuid()}` },
      [
        schema.node(
          'structure_header',
          { level: 4, number: numberConverted },
          schema.node('placeholder', {
            placeholderText: 'Insert section title',
          })
        ),
        schema.node(`section_body`, {}, [
          schema.node(
            'paragraph',
            {},
            schema.node('placeholder', {
              placeholderText: 'Insert section content',
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

export const section = constructStructureNodeSpec({
  type: 'https://say.data.gift/ns/Section',
  content: 'structure_header section_body',
});

export const section_body = constructStructureBodyNodeSpec({
  content: '(subsection|article|paragraph)+',
});
