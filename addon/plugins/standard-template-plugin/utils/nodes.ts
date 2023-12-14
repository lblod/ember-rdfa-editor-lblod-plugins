import {
  getRdfaAttrs,
  NodeSpec,
  rdfaAttrSpec,
  Transaction,
} from '@lblod/ember-rdfa-editor';
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
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

export const besluit_title: NodeSpec = {
  content: 'paragraph+',
  inline: false,
  defining: true,
  canSplit: false,
  attrs: {
    ...rdfaAttrSpec,
    property: {
      default: 'eli:title',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return ['h4', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'h1,h2,h3,h4,h5',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', ELI('title'))) {
          return getRdfaAttrs(element);
        }
        return false;
      },
    },
  ],
};

export const description: NodeSpec = {
  group: 'block',
  content: 'block+',
  inline: false,
  canSplit: false,
  attrs: {
    ...rdfaAttrSpec,
    property: {
      default: 'eli:description',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return ['div', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'div,p',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', ELI('description'))) {
          return getRdfaAttrs(element);
        }
        return false;
      },
    },
  ],
};

export const motivering: NodeSpec = {
  content: 'block+',
  inline: false,
  canSplit: false,
  attrs: {
    ...rdfaAttrSpec,
    property: {
      default: 'besluit:motivering',
    },
    lang: {
      default: 'nl',
    },
  },
  toDOM(node) {
    return ['div', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', BESLUIT('motivering'))) {
          return getRdfaAttrs(element);
        }
        return false;
      },
    },
  ],
};

export const article_container: NodeSpec = {
  group: 'block',
  content: '(block|besluit_article)+',
  inline: false,
  canSplit: false,
  attrs: {
    ...rdfaAttrSpec,
    property: {
      default: 'prov:value',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return ['div', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', PROV('value'))) {
          return getRdfaAttrs(element);
        }
        return false;
      },
      context: 'besluit/',
    },
  ],
};

export const besluit_article: NodeSpec = {
  content:
    'besluit_article_header{1}(language_node*)besluit_article_content{1}',
  inline: false,
  attrs: {
    ...rdfaAttrSpec,
    property: {
      default: 'eli:has_part',
    },
    typeof: {
      default: 'besluit:Artikel',
    },
    resource: {},
  },
  toDOM(node) {
    return ['div', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', ELI('has_part')) &&
          hasRDFaAttribute(element, 'typeof', BESLUIT('Artikel'))
        ) {
          return getRdfaAttrs(element);
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
      up: 'article-structure-plugin.move-up.article',
      down: 'article-structure-plugin.move-down.article',
    },
    remove: 'article-structure-plugin.remove.article',
  },
  limitTo: 'besluit',
  constructor: ({ schema, number, content, intl, state }) => {
    const translationWithDocLang = getTranslationFunction(state);
    const numberConverted = number?.toString() ?? '1';
    const articleRdfaId = uuid();
    const resource = `http://data.lblod.info/articles/${articleRdfaId}`;
    const node = schema.node(
      `besluit_article`,
      {
        resource,
        __rdfaId: articleRdfaId,
      },
      [
        schema.node('besluit_article_header', {
          number: numberConverted,
        }),
        schema.node(
          `besluit_article_content`,
          {},
          content ??
            schema.node(
              'paragraph',
              {},
              schema.node('placeholder', {
                placeholderText: translationWithDocLang(
                  'article-structure-plugin.placeholder.article.body',
                  intl?.t(
                    'article-structure-plugin.placeholder.article.body',
                  ) || '',
                ),
              }),
            ),
        ),
      ],
    );

    return {
      node,
      newResource: resource,
      selectionConfig: {
        type: content ? 'text' : 'node',
        rdfaId: articleRdfaId,
      },
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
  selectable: false,
  attrs: {
    ...rdfaAttrSpec,
    number: {
      default: '1',
    },
  },
  toDOM(node) {
    const toplevelAttrs = { ...node.attrs };
    delete toplevelAttrs.number;
    delete toplevelAttrs.datatype;
    return [
      'div',
      { ...toplevelAttrs, contenteditable: false },
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
      tag: 'p,div',
      getAttrs(element: HTMLElement) {
        const numberNode = element.querySelector(
          `span[property~='${ELI('number').prefixed}'],
           span[property~='${ELI('number').full}']`,
        );
        if (numberNode) {
          return {
            ...getRdfaAttrs(element),
            number: numberNode.textContent,
          };
        }
        return false;
      },
    },
  ],
};

export const besluit_article_content: NodeSpec = {
  group: 'block',
  content: 'block+',
  inline: false,
  attrs: {
    ...rdfaAttrSpec,
    property: {
      default: 'prov:value',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return ['div', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', PROV('value'))) {
          return getRdfaAttrs(element);
        }
        return false;
      },
      context: 'besluit_article//',
    },
  ],
};

export const besluit: NodeSpec = {
  group: 'block',
  content: 'block*besluit_title?block*description?block*motivering?block*',
  inline: false,
  defining: true,
  isolating: true,
  canSplit: false,
  attrs: {
    ...rdfaAttrSpec,
    property: {
      default: 'prov:generated',
    },
    typeof: {
      default: 'besluit:Besluit ext:BesluitNieuweStijl',
    },
    resource: {},
  },
  toDOM(node) {
    return ['div', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', PROV('generated')) &&
          hasRDFaAttribute(element, 'typeof', BESLUIT('Besluit'))
        ) {
          return getRdfaAttrs(element);
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
  atom: true,
  attrs: {
    ...rdfaAttrSpec,
    style: {
      default: 'style="display:none;"',
    },
    property: {
      default: 'eli:language',
    },
    typeof: {
      default: 'skos:Concept',
    },
    resource: {
      default: 'http://publications.europa.eu/resource/authority/language/NLD',
    },
  },
  toDOM(node) {
    return ['span', node.attrs];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', ELI('language')) &&
          hasRDFaAttribute(element, 'typeof', SKOS('Concept'))
        ) {
          return getRdfaAttrs(element);
        }
        return false;
      },
    },
  ],
};
