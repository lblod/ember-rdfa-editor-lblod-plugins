import {
  getRdfaAttrs,
  NodeSpec,
  rdfaAttrSpec,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import {
  getRdfaContentElement,
  hasRdfaContentChild,
  renderRdfaAware,
  sharedRdfaNodeSpec,
} from '@lblod/ember-rdfa-editor/core/schema';
import {
  BESLUIT,
  ELI,
  PROV,
  RDF,
  SKOS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasBacklink,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { StructureSpec } from '../../article-structure-plugin';
import { v4 as uuid } from 'uuid';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { getNumberUtils } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';

export const besluit_title: NodeSpec = {
  content: 'paragraph+',
  inline: false,
  defining: true,
  canSplit: false,
  ...sharedRdfaNodeSpec,
  editable: true,
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
    return renderRdfaAware({
      renderable: node,
      tag: 'h4',
      rdfaContainerTag: 'span',
      contentContainerTag: 'span',
      attrs: {
        ...node.attrs,
        class: 'say-editable',
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'h1,h2,h3,h4,h5',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, ELI('title')) &&
          hasRdfaContentChild(element)
        ) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
    // Compatibility with pre-RDFa-aware HTML
    {
      tag: 'h1,h2,h3,h4,h5',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', ELI('title'))) {
          const rdfaAttrs = getRdfaAttrs(element);
          return {
            ...rdfaAttrs,
            subject: element.getAttribute('resource'),
          };
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
  ...sharedRdfaNodeSpec,
  editable: true,
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
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-editable',
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'div,p',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, ELI('description')) &&
          hasRdfaContentChild(element)
        ) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
    // Compatibility with pre-RDFa-aware HTML
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
  ...sharedRdfaNodeSpec,
  editable: true,
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
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-editable',
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, BESLUIT('motivering')) &&
          hasRdfaContentChild(element)
        ) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
    // Compatibility with pre-RDFa-aware HTML
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
  ...sharedRdfaNodeSpec,
  editable: true,
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
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-editable',
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, PROV('value')) &&
          hasRdfaContentChild(element)
        ) {
          return rdfaAttrs;
        }
        return false;
      },
      context: 'besluit/',
      contentElement: getRdfaContentElement,
    },
    // Compatibility with pre-RDFa-aware HTML
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
  ...sharedRdfaNodeSpec,
  editable: true,
  attrs: {
    ...rdfaAttrSpec,
    typeof: {
      default: BESLUIT('Artikel').prefixed,
    },
    subject: {},
  },
  toDOM(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-editable',
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, ELI('has_part')) &&
          hasOutgoingNamedNodeTriple(
            rdfaAttrs,
            RDF('type'),
            BESLUIT('Artikel'),
          ) &&
          hasRdfaContentChild(element)
        ) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
    // Compatibility with pre-RDFa-aware HTML
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
    const subject = `http://data.lblod.info/articles/${articleRdfaId}`;
    const node = schema.node(
      `besluit_article`,
      {
        subject,
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
      newResource: subject,
      selectionConfig: {
        type: content ? 'text' : 'node',
        rdfaId: articleRdfaId,
      },
    };
  },
  ...getNumberUtils({
    offset: 1,
  }),
  content: ({ pos, state }) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return unwrap(node.lastChild).content;
  },
  continuous: false,
};

// TODO Fix this representation so it works well with RDFa editing tools.
export const besluit_article_header: NodeSpec = {
  inline: false,
  isLeaf: true,
  ...sharedRdfaNodeSpec,
  attrs: {
    ...rdfaAttrSpec,
    number: {
      default: '1',
    },
  },
  toDOM(node) {
    const { number, ...attrs } = node.attrs;
    return [
      'div',
      { contenteditable: false },
      'Artikel ',
      renderRdfaAware({
        renderable: node,
        tag: 'span',
        attrs: {
          ...attrs,
          class: 'say-inline-rdfa',
        },
        content: (number as string) ?? '1',
      }),
    ];
  },
  parseDOM: [
    {
      tag: 'p,div',
      context: 'besluit_article/',
      getAttrs(element: HTMLElement) {
        const numberNode = element.querySelector(
          `span[property~='${ELI('number').prefixed}'],
           span[property~='${ELI('number').full}']`,
        );
        if (numberNode) {
          return {
            ...getRdfaAttrs(numberNode as HTMLElement),
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
  ...sharedRdfaNodeSpec,
  editable: true,
  attrs: {
    ...rdfaAttrSpec,
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-editable',
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, PROV('value')) &&
          hasRdfaContentChild(element)
        ) {
          return getRdfaAttrs(element);
        }
        return false;
      },
      contentElement: getRdfaContentElement,
      context: 'besluit_article/',
    },
    // Compatibility with pre-RDFa-aware HTML
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
  ...sharedRdfaNodeSpec,
  editable: true,
  canSplit: false,
  attrs: {
    ...rdfaAttrSpec,
    typeof: {
      default: 'besluit:Besluit ext:BesluitNieuweStijl',
    },
    subject: {},
  },
  toDOM(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-editable',
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, PROV('generated')) &&
          hasOutgoingNamedNodeTriple(
            rdfaAttrs,
            RDF('type'),
            BESLUIT('Besluit'),
          ) &&
          hasRdfaContentChild(element)
        ) {
          return {
            typeof: element.getAttribute('typeof'),
            ...rdfaAttrs,
          };
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
    // Compatibility with pre-RDFa-aware HTML
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          hasRDFaAttribute(element, 'property', PROV('generated')) &&
          hasRDFaAttribute(element, 'typeof', BESLUIT('Besluit'))
        ) {
          return {
            typeof: element.getAttribute('typeof'),
            ...getRdfaAttrs(element),
          };
        }
        return false;
      },
    },
  ],
};

// TODO this can most likely be removed as language can just be a property rather than needing a
// separate hidden node
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
    subject: {
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
        const rdfaAttrs = getRdfaAttrs(element);
        if (
          hasBacklink(rdfaAttrs, ELI('language')) &&
          hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), SKOS('Concept'))
        ) {
          return getRdfaAttrs(element);
        }
        return false;
      },
    },
    // Compatibility with pre-RDFa-aware HTML
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
