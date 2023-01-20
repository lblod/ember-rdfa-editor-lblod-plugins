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
      up: 'article-structure-plugin.moveUp.paragraph',
      down: 'article-structure-plugin.moveDown.paragraph',
    },
    remove: 'article-structure-plugin.remove.paragraph',
  },
  continuous: true,
  constructor: ({ schema, number, intl }) => {
    const numberConverted = number?.toString() ?? '1';
    const node = schema.node(
      `article_paragraph`,
      {
        resource: `http://data.lblod.info/paragraphs/${uuid()}`,
        number: numberConverted,
      },
      schema.node('placeholder', {
        placeholderText: intl?.t(PLACEHOLDERS.body),
      })
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
  content: 'inline*',
  inline: false,
  attrs: {
    resource: {},
    number: {
      default: '1',
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: SAY('hasParagraph').prefixed,
        typeof: SAY('Paragraph').prefixed,
        resource: node.attrs.resource as string,
      },
      '$',
      [
        'span',
        { property: ELI('number').prefixed, datatype: XSD('integer').prefixed },
        node.attrs.number,
      ],
      '. ',
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
