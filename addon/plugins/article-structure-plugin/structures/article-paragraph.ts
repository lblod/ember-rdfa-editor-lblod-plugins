import { NodeSpec, Schema, Transaction } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import { v4 as uuid } from 'uuid';

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
  constructor: (schema: Schema, number: number) => {
    const numberConverted = number.toString();
    const node = schema.node(
      `article_paragraph`,
      {
        resource: `http://data.lblod.info/paragraphs/${uuid()}`,
        number: numberConverted,
      },
      schema.node('placeholder', {
        placeholderText: 'Insert paragraph content',
      })
    );
    return node;
  },
  updateNumber: (number: number, pos: number, transaction: Transaction) => {
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
        property: 'say:hasParagraph',
        typeof: `https://say.data.gift/ns/Paragraph`,
        resource: node.attrs.resource as string,
      },
      '$',
      [
        'span',
        { property: 'eli:number', datatype: 'xsd:integer' },
        node.attrs.number,
      ],
      '. ',
      ['span', { property: 'say:body' }, 0],
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          element.getAttribute('property') === 'say:hasParagraph' &&
          element
            .getAttribute('typeof')
            ?.includes('https://say.data.gift/ns/Paragraph') &&
          element.getAttribute('resource')
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
      contentElement: `span[property='say:body']`,
    },
  ],
};
