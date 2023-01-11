import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  romanize,
} from '../utils/structure';
import { v4 as uuid } from 'uuid';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespaces';

const PLACEHOLDERS = {
  heading: 'article-structure-plugin.placeholder.generic.heading',
  body: 'article-structure-plugin.placeholder.generic.body',
};
export const titleSpec: StructureSpec = {
  name: 'title',
  context: ['doc', 'block'],
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.title',
    move: {
      up: 'article-structure-plugin.moveUp.title',
      down: 'article-structure-plugin.moveDown.title',
    },
    remove: 'article-structure-plugin.remove.title',
  },
  constructor: ({ schema, number, content, intl }) => {
    const numberConverted = romanize(number ?? 1);
    const node = schema.node(
      `title`,
      { resource: `http://data.lblod.info/titles/${uuid()}` },
      [
        schema.node(
          'structure_header',
          { level: 3, number: numberConverted },
          schema.node('placeholder', {
            placeholderText: intl?.t(PLACEHOLDERS.heading),
          })
        ),
        schema.node(
          `title_body`,
          {},
          content ??
            schema.node(
              'paragraph',
              {},
              schema.node('placeholder', {
                placeholderText: intl?.t(PLACEHOLDERS.body),
              })
            )
        ),
      ]
    );
    const selectionConfig: {
      relativePos: number;
      type: 'text' | 'node';
    } = content
      ? { relativePos: 5, type: 'text' }
      : { relativePos: 6, type: 'node' };
    return {
      node,
      selectionConfig,
    };
  },
  updateNumber: ({ number, pos, transaction }) => {
    const numberConverted = romanize(number);
    return transaction.setNodeAttribute(pos + 1, 'number', numberConverted);
  },
  content: ({ pos, state }) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return node.child(1).content;
  },
};

export const title = constructStructureNodeSpec({
  type: SAY('Title'),
  content: 'structure_header title_body',
  group: 'block',
});

export const title_body = constructStructureBodyNodeSpec({
  content: '(chapter|paragraph)+|(article|paragraph)+',
});
