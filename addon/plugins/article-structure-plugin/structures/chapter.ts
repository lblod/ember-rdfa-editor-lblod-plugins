import { romanize } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
} from '../utils';
import { v4 as uuid } from 'uuid';

const PLACEHOLDERS = {
  title: 'article-structure-plugin.placeholder.chapter.heading',
  body: 'article-structure-plugin.placeholder.chapter.body',
};
export const chapterSpec: StructureSpec = {
  name: 'chapter',
  context: ['doc'],
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.chapter',
    move: {
      up: 'article-structure-plugin.moveUp.chapter',
      down: 'article-structure-plugin.moveDown.chapter',
    },
    remove: 'article-structure-plugin.remove.chapter',
  },
  constructor: ({ schema, number, content, intl }) => {
    const numberConverted = romanize(number ?? 1);
    const node = schema.node(
      `chapter`,
      { resource: `http://data.lblod.info/chapters/${uuid()}` },
      [
        schema.node(
          'structure_header',
          { level: 4, number: numberConverted },
          schema.node('placeholder', {
            placeholderText: intl?.t(PLACEHOLDERS.title),
          })
        ),
        schema.node(
          `chapter_body`,
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
    return node;
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

export const chapter = constructStructureNodeSpec({
  type: 'https://say.data.gift/ns/Chapter',
  content: 'structure_header chapter_body',
  group: 'block',
});

export const chapter_body = constructStructureBodyNodeSpec({
  content: '(section|paragraph)+|(article|paragraph)+',
});
