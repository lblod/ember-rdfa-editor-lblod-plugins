import { NodeSpec, Transaction } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  ELI,
  PROV,
  SKOS,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { StructureSpec } from '../../article-structure-plugin';
import { v4 as uuid } from 'uuid';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const title: NodeSpec = {
  group: 'block',
  content: 'text*|placeholder',
  inline: false,
  attrs: {
    property: {
      default: 'eli:title',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'h4',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'h4',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', ELI('title'))) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const description: NodeSpec = {
  group: 'block',
  content: 'text*|placeholder',
  inline: false,
  attrs: {
    property: {
      default: 'eli:description',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'p',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'p',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', ELI('description'))) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const motivering: NodeSpec = {
  group: 'block',
  content: '(paragraph|heading|bullet_list)*',
  inline: false,
  attrs: {
    property: {
      default: 'besluit:motivering',
    },
    lang: {
      default: 'nl',
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        lang: node.attrs.lang as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', BESLUIT('motivering'))) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const article_container: NodeSpec = {
  group: 'block',
  content: 'besluit_article*',
  inline: false,
  attrs: {
    property: {
      default: 'prov:value',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', PROV('value')) &&
          hasRDFaAttribute(element, 'typeof', BESLUIT('Besluit'))
        ) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const besluit_article: NodeSpec = {
  content:
    'besluit_article_header{1}(language_node*)besluit_article_content{1}',
  inline: false,
  attrs: {
    property: {
      default: 'eli:has_part',
    },
    typeof: {
      default: 'besluit:Artikel',
    },
    resource: {},
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        typeof: node.attrs.typeof as string,
        resource: node.attrs.resource as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', ELI('has_part')) &&
          hasRDFaAttribute(element, 'typeof', BESLUIT('Artikel'))
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};

export const besluitArticleStructure: StructureSpec = {
  name: 'besluit_article',
  translations: {
    insert: 'article-structure-plugin.insert.article',
    move: {
      up: 'article-structure-plugin.moveUp.article',
      down: 'article-structure-plugin.moveDown.article',
    },
    remove: 'article-structure-plugin.remove.article',
  },
  constructor: ({ schema, number, content, intl }) => {
    const numberConverted = number?.toString() ?? '1';
    const node = schema.node(
      `besluit_article`,
      { resource: `http://data.lblod.info/articles/${uuid()}` },
      [
        schema.node('besluit_article_header', { number: numberConverted }),
        schema.node(
          `besluit_article_content`,
          {},
          content ??
            schema.node(
              'paragraph',
              {},
              schema.node('placeholder', {
                placeholderText: intl?.t(
                  'article-structure-plugin.placeholder.article.body'
                ),
              })
            )
        ),
      ]
    );
    const selectionConfig: {
      relativePos: number;
      type: 'text' | 'node';
    } = content
      ? { relativePos: 3, type: 'text' }
      : { relativePos: 4, type: 'node' };
    return {
      node,
      selectionConfig,
    };
  },
  updateNumber: function ({ number, pos, transaction }): Transaction {
    transaction.setNodeAttribute(pos + 1, 'number', number.toString());
    return transaction;
  },
  content: ({ pos, state }) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return unwrap(node.lastChild).content;
  },
  continuous: false,
};

export const besluit_article_header: NodeSpec = {
  inline: false,
  attrs: {
    number: {
      default: '1',
    },
  },
  toDOM(node) {
    return [
      'p',
      {},
      'Artikel ',
      [
        'span',
        { property: ELI('number').prefixed, datatype: XSD('string').prefixed },
        node.attrs.number,
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'p',
      getAttrs(element: HTMLElement) {
        const numberNode = element.querySelector(
          `span[property~=${ELI('number').prefixed}],
           span[property~=${ELI('number').full}]`
        );
        if (numberNode) {
          return {
            number: numberNode.textContent,
          };
        }
        return false;
      },
    },
  ],
};
//   group: 'block',
//   content: 'text*besluitArticleNumber{1}',
//   inline: false,
//   attrs: {},
//   toDOM() {
//     return ['div', {}, 0];
//   },
//   parseDOM: [
//     {
//       tag: 'div',
//       getAttrs(element: HTMLElement) {
//         if (
//           element.parentElement &&
//           hasRDFaAttribute(
//             element.parentElement,
//             'typeof',
//             BESLUIT('Artikel')
//           ) &&
//           hasRDFaAttribute(element, 'property', PROV('value'))
//         ) {
//           return {};
//         }
//         return false;
//       },
//     },
//   ],
// };

// export const besluitArticleNumber: NodeSpec = {
//   group: 'inline',
//   content: 'text*',
//   inline: true,
//   attrs: {
//     property: {
//       default: 'eli:number',
//     },
//     datatype: {
//       default: 'xsd:string',
//     },
//   },
//   toDOM(node) {
//     return [
//       'span',
//       {
//         property: node.attrs.property as string,
//         datatype: node.attrs.datatype as string,
//       },
//       0,
//     ];
//   },
//   parseDOM: [
//     {
//       tag: 'span',
//       getAttrs(element: HTMLElement) {
//         if (
//           hasRDFaAttribute(element, 'property', ELI('number')) &&
//           element.parentElement &&
//           hasRDFaAttribute(element.parentElement, 'typeof', BESLUIT('Artikel'))
//         ) {
//           return {};
//         }
//         return false;
//       },
//     },
//   ],
// };

export const besluit_article_content: NodeSpec = {
  content: 'block+',
  inline: false,
  attrs: {
    property: {
      default: 'prov:value',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', PROV('value'))) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const besluit: NodeSpec = {
  group: 'block',
  content:
    '(paragraph|heading|language_node)*title{1}(paragraph|heading|language_node)*description{1}(paragraph|heading|language_node)*motivering{1}(paragraph|heading|language_node)*article_container{1}(paragraph|heading|language_node)*',
  inline: false,
  attrs: {
    property: {
      default: 'prov:generated',
    },
    typeof: {
      default: 'besluit:Besluit ext:BesluitNieuweStijl',
    },
    resource: {},
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        typeof: node.attrs.typeof as string,
        resource: node.attrs.resource as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', PROV('generated')) &&
          hasRDFaAttribute(element, 'typeof', BESLUIT('Besluit'))
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};

export const language_node: NodeSpec = {
  group: 'block',
  content: '',
  inline: false,
  attrs: {
    style: {
      default: 'style="display:none;"',
    },
    property: {
      default: 'eli:language',
    },
    typeof: {
      default: 'skos:Concept',
    },
    resource: {},
  },
  toDOM(node) {
    return [
      'span',
      {
        property: node.attrs.property as string,
        typeof: node.attrs.typeof as string,
        resource: node.attrs.resource as string,
        style: node.attrs.style as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', ELI('language')) &&
          hasRDFaAttribute(element, 'typeof', SKOS('Concept'))
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};
