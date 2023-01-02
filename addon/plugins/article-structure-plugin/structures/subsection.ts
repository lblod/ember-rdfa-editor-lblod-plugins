import { EditorState, Transaction } from '@lblod/ember-rdfa-editor';
import { romanize } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils';
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
  translations: {
    insert: 'article-structure-plugin.insert.subsection',
    move: {
      up: 'article-structure-plugin.moveUp.subsection',
      down: 'article-structure-plugin.moveDown.subsection',
    },
    remove: 'article-structure-plugin.remove.subsection',
  },
  constructor: (schema, number, content) => {
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
        schema.node(
          `subsection_body`,
          {},
          content ??
            schema.node(
              'paragraph',
              {},
              schema.node('placeholder', {
                placeholderText: 'Insert subsection content',
              })
            )
        ),
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
  content: '(article|paragraph)+',
});
