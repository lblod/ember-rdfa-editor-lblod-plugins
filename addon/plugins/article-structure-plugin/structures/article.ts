import { NodeSpec, PNode } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  getNumberDocSpecFromNode,
  getNumberAttributesFromNode,
  getNumberUtils,
  getStructureHeaderAttrs,
} from '../utils/structure';
import { v4 as uuid } from 'uuid';
import {
  EXT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

const PLACEHOLDERS = {
  title: 'article-structure-plugin.placeholder.article.heading',
  body: 'article-structure-plugin.placeholder.article.body',
};
export const articleSpec: StructureSpec = {
  name: 'article',
  translations: {
    insert: 'article-structure-plugin.insert.article',
    move: {
      up: 'article-structure-plugin.move-up.article',
      down: 'article-structure-plugin.move-down.article',
    },
    remove: 'article-structure-plugin.remove.article',
    removeWithContent: 'article-structure-plugin.remove-with-content.article',
  },
  continuous: true,
  constructor: ({ schema, number, content, intl, state }) => {
    const numberConverted = number?.toString() ?? '1';
    const translationWithDocLang = getTranslationFunction(state);
    const node = schema.node(
      `article`,
      { resource: `http://data.lblod.info/articles/${uuid()}` },
      [
        schema.node(
          'article_header',
          { level: 4, number: numberConverted },
          schema.node('placeholder', {
            placeholderText: translationWithDocLang(
              PLACEHOLDERS.title,
              intl?.t(PLACEHOLDERS.title) || '',
            ),
          }),
        ),
        schema.node(
          `article_body`,
          {},
          content ??
            schema.node(
              'paragraph',
              {},
              schema.node('placeholder', {
                placeholderText: translationWithDocLang(
                  PLACEHOLDERS.body,
                  intl?.t(PLACEHOLDERS.body) || '',
                ),
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
  ...getNumberUtils(1),
  content: ({ pos, state }) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return node.child(1).content;
  },
};

export const article = constructStructureNodeSpec({
  type: SAY('Article'),
  content: 'article_header article_body',
});

export const article_header: NodeSpec = {
  content: 'text*|placeholder',
  inline: false,
  isolating: true,
  defining: true,
  attrs: {
    number: {
      default: '1',
    },
    numberDisplayStyle: {
      default: 'decimal', // decimal, roman
    },
    startNumber: {
      default: null,
    },
    property: {
      default: SAY('heading').prefixed,
    },
  },
  allowSplitByTable: false,
  outlineText: (node: PNode) => {
    const { number } = node.attrs;
    return `Artikel ${number as string}: ${node.textContent}`;
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        ...getNumberAttributesFromNode(node),
      },
      'Artikel ',
      getNumberDocSpecFromNode(node),
      ['span', { contenteditable: false }, ': '],
      [
        'span',
        {
          property: EXT('title').prefixed,
        },
        0,
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const headerAttrs = getStructureHeaderAttrs(element);

        if (headerAttrs) {
          return headerAttrs;
        }

        return false;
      },
      contentElement: `span[property~='${EXT('title').prefixed}'],
                       span[property~='${EXT('title').full}']`,
    },
  ],
};

export const article_body = constructStructureBodyNodeSpec({
  content: '(block|article_paragraph)+',
});
