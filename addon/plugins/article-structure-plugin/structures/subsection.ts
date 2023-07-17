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
  title: 'article-structure-plugin.placeholder.subsection.heading',
  body: 'article-structure-plugin.placeholder.subsection.body',
};

export const subsectionSpec: StructureSpec = {
  name: 'subsection',
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.subsection',
    move: {
      up: 'article-structure-plugin.move-up.subsection',
      down: 'article-structure-plugin.move-down.subsection',
    },
    remove: 'article-structure-plugin.remove.subsection',
    removeWithContent:
      'article-structure-plugin.remove-with-content.subsection',
  },
  constructor: ({ schema, number, intl, content }) => {
    const numberConverted = romanize(number ?? 1);
    const node = schema.node(
      `subsection`,
      { resource: `http://data.lblod.info/subsections/${uuid()}` },
      [
        schema.node(
          'structure_header',
          { level: 6, number: numberConverted },
          schema.node('placeholder', {
            placeholderText: intl?.t(PLACEHOLDERS.title),
          }),
        ),
        schema.node(
          `subsection_body`,
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

export const subsection = constructStructureNodeSpec({
  type: SAY('Subsection'),
  content: 'structure_header subsection_body',
});

export const subsection_body = constructStructureBodyNodeSpec({
  content: '(article|block)+',
});
