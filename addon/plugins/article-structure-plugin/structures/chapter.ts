import { EditorState, Schema, Transaction } from '@lblod/ember-rdfa-editor';
import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
} from '../utils';
import { v4 as uuid } from 'uuid';

export const chapterSpec: StructureSpec = {
  name: 'chapter',
  context: ['doc'],
  continuous: false,
  constructor: (schema: Schema, number: number) => {
    const numberConverted = romanize(number);
    const node = schema.node(
      `chapter`,
      { resource: `http://data.lblod.info/chapters/${uuid()}` },
      [
        schema.node(
          'structure_header',
          { level: 4, number: numberConverted },
          schema.node('placeholder', {
            placeholderText: 'Insert chapter title',
          })
        ),
        schema.node(`chapter_body`, {}, [
          schema.node(
            'paragraph',
            {},
            schema.node('placeholder', {
              placeholderText: 'Insert chapter content',
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

export const chapter = constructStructureNodeSpec({
  type: 'https://say.data.gift/ns/Chapter',
  content: 'structure_header chapter_body',
  group: 'block',
});

export const chapter_body = constructStructureBodyNodeSpec({
  content: '(section|article|paragraph)+',
});
