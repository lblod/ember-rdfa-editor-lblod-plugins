import { NodeSpec } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import { v4 as uuid } from 'uuid';
import { ELI, SAY, XSD } from '../constants';
import { hasRDFaAttribute } from '../utils/namespace';

const PLACEHOLDERS = {
  body: 'article-structure-plugin.placeholder.paragraph.body',
};

export const articleParagraphSpec: StructureSpec = {
  name: 'article_paragraph',
  context: ['article_body'],
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

export const article_paragraph: NodeSpec = {
  content: 'text*|placeholder',
  inline: false,
  attrs: {
    resource: {},
    number: {
      default: 1,
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
        if (
          hasRDFaAttribute(element, 'property', SAY('hasParagraph')) &&
          hasRDFaAttribute(element, 'typeof', SAY('Paragraph')) &&
          element.getAttribute('resource')
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
      contentElement: `span[property~='${SAY('body').prefixed}'],
                       span[property~='${SAY('body').full}']`,
    },
  ],
};
