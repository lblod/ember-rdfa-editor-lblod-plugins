import { getRdfaAttrs, NodeSpec, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import {
  getRdfaContentElement,
  RdfaAttrs,
  renderRdfaAware,
  sharedRdfaNodeSpec,
} from '@lblod/ember-rdfa-editor/core/schema';
import {
  BESLUIT,
  ELI,
  PROV,
  RDF,
  SKOS,
  XSD,
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
import { maybeNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

const rdfaAware = true;
export const besluit_title: NodeSpec = {
  content: 'paragraph+',
  inline: false,
  defining: true,
  canSplit: false,
  ...sharedRdfaNodeSpec,
  editable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (hasBacklink(rdfaAttrs, ELI('title'))) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
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
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (hasBacklink(rdfaAttrs, ELI('description'))) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
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
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (hasBacklink(rdfaAttrs, BESLUIT('motivering'))) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
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
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (hasBacklink(rdfaAttrs, PROV('value'))) {
          return rdfaAttrs;
        }
        return false;
      },
      context: 'besluit/',
      contentElement: getRdfaContentElement,
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
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });

        if (
          rdfaAttrs &&
          rdfaAttrs.rdfaNodeType === 'resource' &&
          hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), BESLUIT('Artikel'))
        ) {
          // Filter out properties we handle ourselves (like the article number)
          const filteredProperties = rdfaAttrs.properties.filter(
            (prop) => !ELI('number').matches(prop.predicate),
          );
          return { ...rdfaAttrs, properties: filteredProperties };
        }
        return false;
      },
      contentElement: getRdfaContentElement,
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
  relationshipPredicate: ELI('has_part'),
  constructor: ({ schema, number, content, intl, state }) => {
    const translationWithDocLang = getTranslationFunction(state);
    const articleRdfaId = uuid();
    const bodyRdfaId = uuid();
    const subject = `http://data.lblod.info/articles/${articleRdfaId}`;

    const articleAttrs: RdfaAttrs = {
      __rdfaId: articleRdfaId,
      rdfaNodeType: 'resource',
      subject,
      properties: [
        {
          predicate: RDF('type').prefixed,
          object: sayDataFactory.namedNode(BESLUIT('Artikel').full),
        },
        {
          predicate: PROV('value').prefixed,
          object: sayDataFactory.literalNode(bodyRdfaId),
        },
      ],
      backlinks: [],
    };
    const bodyAttrs: RdfaAttrs = {
      __rdfaId: bodyRdfaId,
      rdfaNodeType: 'literal',
      backlinks: [
        {
          subject: sayDataFactory.literalNode(subject),
          predicate: PROV('value').prefixed,
        },
      ],
    };
    const node = schema.node(`besluit_article`, articleAttrs, [
      schema.node('besluit_article_header', {
        number: number ?? 1,
      }),
      schema.node(
        `besluit_article_content`,
        bodyAttrs,
        content ??
          schema.node(
            'paragraph',
            {},
            schema.node('placeholder', {
              placeholderText: translationWithDocLang(
                'article-structure-plugin.placeholder.article.body',
                intl?.t('article-structure-plugin.placeholder.article.body') ||
                  '',
              ),
            }),
          ),
      ),
    ]);

    return {
      node,
      newResource: subject,
      selectionConfig: {
        type: content ? 'text' : 'node',
        rdfaId: articleRdfaId,
      },
    };
  },
  setNumber: ({ number, pos, transaction }) =>
    transaction.setNodeAttribute(pos + 1, 'number', number),
  getNumber: ({ pos, transaction }) => {
    const node = unwrap(transaction.doc.nodeAt(pos + 1));

    const number = maybeNumber(node.attrs.number);

    if (number !== null) {
      return number;
    }

    return null;
  },
  numberConfig: {},
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
    number: {
      default: 1,
    },
  },
  toDOM(node) {
    const { number } = node.attrs;
    return [
      'div',
      { contenteditable: false },
      'Artikel ',
      [
        'span',
        { property: ELI('number').prefixed, datatype: XSD('integer').prefixed },
        (number as number).toString() ?? '1',
      ],
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
          const number = numberNode.textContent
            ? parseInt(numberNode.textContent, 10)
            : 1;
          return {
            number,
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
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (hasBacklink(rdfaAttrs, PROV('value'))) {
          return getRdfaAttrs(element, { rdfaAware });
        }
        return false;
      },
      contentElement: getRdfaContentElement,
      context: 'besluit_article/',
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
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (
          hasBacklink(rdfaAttrs, PROV('generated')) &&
          hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), BESLUIT('Besluit'))
        ) {
          return {
            ...rdfaAttrs,
          };
        }
        return false;
      },
      contentElement: getRdfaContentElement,
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
    ...rdfaAttrSpec({ rdfaAware }),
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
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (
          hasBacklink(rdfaAttrs, ELI('language')) &&
          hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), SKOS('Concept'))
        ) {
          return getRdfaAttrs(element, { rdfaAware });
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
          return getRdfaAttrs(element, { rdfaAware });
        }
        return false;
      },
    },
  ],
};
