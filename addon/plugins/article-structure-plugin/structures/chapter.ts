import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  romanize,
} from '../utils/structure';
import { v4 as uuid } from 'uuid';
import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

const PLACEHOLDERS = {
  title: 'article-structure-plugin.placeholder.chapter.heading',
  body: 'article-structure-plugin.placeholder.chapter.body',
};
export const chapterSpec: StructureSpec = {
  name: 'chapter',
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.chapter',
    move: {
      up: 'article-structure-plugin.move-up.chapter',
      down: 'article-structure-plugin.move-down.chapter',
    },
    remove: 'article-structure-plugin.remove.chapter',
    removeWithContent: 'article-structure-plugin.remove-with-content.chapter',
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
          }),
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
              }),
            ),
        ),
      ],
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

export const chapter = constructStructureNodeSpec({
  type: SAY('Chapter'),
  content: 'structure_header chapter_body',
});

export const chapter_body = constructStructureBodyNodeSpec({
  content: '(section|block)+|(article|block)+',
});
