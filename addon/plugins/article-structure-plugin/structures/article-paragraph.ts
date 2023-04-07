import { Fragment, NodeSpec } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import { v4 as uuid } from 'uuid';
import {
  ELI,
  SAY,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

const PLACEHOLDERS = {
  body: 'article-structure-plugin.placeholder.paragraph.body',
};

export const articleParagraphSpec: StructureSpec = {
  name: 'article_paragraph',
  translations: {
    insert: 'article-structure-plugin.insert.paragraph',
    move: {
      up: 'article-structure-plugin.move-up.paragraph',
      down: 'article-structure-plugin.move-down.paragraph',
    },
    remove: 'article-structure-plugin.remove.paragraph',
    removeWithContent: 'article-structure-plugin.remove-with-content.paragraph',
  },
  continuous: false,
  noUnwrap: true,
  constructor: ({ schema, number, intl }) => {
    const numberConverted = number?.toString() ?? '1';
    const node = schema.node(
      `article_paragraph`,
      {
        resource: `http://data.lblod.info/paragraphs/${uuid()}`,
        number: numberConverted,
      },
      schema.node(
        'paragraph',
        {},
        schema.node('placeholder', {
          placeholderText: intl?.t(PLACEHOLDERS.body),
        })
      )
    );
    return { node, selectionConfig: { relativePos: 1, type: 'node' } };
  },
  updateNumber: ({ number, pos, transaction }) => {
    const numberConverted = number.toString();
    return transaction.setNodeAttribute(pos, 'number', numberConverted);
  },
};

const contentSelector = `span[property~='${SAY('body').prefixed}'],
                         span[property~='${SAY('body').full}']`;

export const article_paragraph: NodeSpec = {
  content: 'paragraph*',
  inline: false,
  isolating: true,
  defining: true,
  attrs: {
    typeof: {
      default: SAY('Paragraph').prefixed,
    },
    property: {
      default: SAY('hasParagraph').prefixed,
    },
    resource: {},
    number: {
      default: '1',
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        typeof: node.attrs.typeof as string,
        resource: node.attrs.resource as string,
      },
      ['span', { contenteditable: false }, '§'],
      [
        'span',
        {
          property: ELI('number').prefixed,
          datatype: XSD('integer').prefixed,
          contenteditable: false,
        },
        node.attrs.number,
      ],
      ['span', { contenteditable: false }, '. '],
      ['span', { property: SAY('body').prefixed }, 0],
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const numberSpan = element.querySelector(`
        span[property~='${ELI('number').prefixed}'],
        span[property~='${ELI('number').full}']`);
        if (
          hasRDFaAttribute(element, 'property', SAY('hasParagraph')) &&
          hasRDFaAttribute(element, 'typeof', SAY('Paragraph')) &&
          element.getAttribute('resource') &&
          element.querySelector(contentSelector) &&
          numberSpan
        ) {
          return {
            resource: element.getAttribute('resource'),
            number: numberSpan.textContent,
          };
        }
        return false;
      },
      contentElement: contentSelector,
    },
    // Parsing rule for backwards compatibility (when content was not inside seperate say:body div)
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const numberSpan = element.querySelector(`
        span[property~='${ELI('number').prefixed}'],
        span[property~='${ELI('number').full}']`);
        if (
          hasRDFaAttribute(element, 'property', SAY('hasParagraph')) &&
          hasRDFaAttribute(element, 'typeof', SAY('Paragraph')) &&
          element.getAttribute('resource') &&
          numberSpan
        ) {
          return {
            resource: element.getAttribute('resource'),
            number: numberSpan.textContent,
          };
        }
        return false;
      },
      getContent: (node, schema) => {
        const content = node.lastChild?.textContent;
        if (content) {
          return Fragment.from(schema.text(content));
        } else {
          return Fragment.empty;
        }
      },
    },
  ],
};
