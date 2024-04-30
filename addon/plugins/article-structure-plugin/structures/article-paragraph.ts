import { Fragment, NodeSpec, RdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  hasRdfaContentChild,
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAware,
  getRdfaContentElement,
} from '@lblod/ember-rdfa-editor/core/schema';
import { StructureSpec } from '..';
import { v4 as uuid } from 'uuid';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  ELI,
  RDF,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
const rdfaAware = true;
import {
  constructStructureBodyNodeSpec,
  getNumberUtils,
} from '../utils/structure';

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
  relationshipPredicate: SAY('hasParagraph'),
  constructor: ({ schema, number }) => {
    const numberConverted = number?.toString() ?? '1';
    const paragraphRdfaId = uuid();
    const numberRdfaId = uuid();
    const bodyRdfaId = uuid();
    const subject = `http://data.lblod.info/paragraphs/${paragraphRdfaId}`;
    const paragraphAttrs: RdfaAttrs = {
      __rdfaId: paragraphRdfaId,
      rdfaNodeType: 'resource',
      subject,
      properties: [
        {
          predicate: ELI('number').prefixed,
          object: sayDataFactory.literalNode(numberRdfaId),
        },
        {
          predicate: SAY('body').prefixed,
          object: sayDataFactory.literalNode(bodyRdfaId),
        },
      ],
      backlinks: [],
    };
    const numberAttrs: RdfaAttrs = {
      __rdfaId: numberRdfaId,
      rdfaNodeType: 'literal',
      backlinks: [
        {
          predicate: ELI('number').prefixed,
          subject: sayDataFactory.literalNode(subject),
        },
      ],
    };
    const bodyAttrs: RdfaAttrs = {
      __rdfaId: bodyRdfaId,
      rdfaNodeType: 'literal',
      backlinks: [
        {
          predicate: SAY('body').prefixed,
          subject: sayDataFactory.literalNode(subject),
        },
      ],
    };
    const node = schema.node(`article_paragraph`, paragraphAttrs, [
      schema.node('article_paragraph_number', {}, [
        schema.text('§'),
        schema.node(
          'structure_header_number',
          numberAttrs,
          schema.text(numberConverted),
        ),
        schema.text('. '),
      ]),
      schema.node(
        'article_paragraph_body',
        bodyAttrs,
        schema.node('paragraph', {}),
      ),
    ]);
    return {
      node,
      selectionConfig: { rdfaId: bodyRdfaId, type: 'text' },
      newResource: subject,
    };
  },
  ...getNumberUtils({
    offset: 0,
    convertNumber: (number) => number.toString(),
  }),
};

export const article_paragraph_body = constructStructureBodyNodeSpec({
  tag: 'span',
  content: 'block+',
  context: 'article_paragraph/',
});

export const article_paragraph_number: NodeSpec = {
  content: 'text* structure_header_number text*',
  inline: false,
  editable: false,
  toDOM(node) {
    return ['span', { class: 'article-paragraph-number', ...node.attrs }, 0];
  },
  parseDOM: [
    {
      tag: 'span',
      context: 'article_paragraph/',
      getAttrs(element: HTMLElement) {
        if (element.querySelector(`[property~="${ELI('number').prefixed}"]`)) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const article_paragraph: NodeSpec = {
  content: 'article_paragraph_number article_paragraph_body',
  inline: false,
  isolating: true,
  editable: true,
  defining: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    typeof: {
      default: SAY('Paragraph').prefixed,
    },
    number: {
      default: 1,
    },
    numberDisplayStyle: {
      default: 'decimal',
    },
    startNumber: {
      default: null,
    },
  },
  toDOM(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      contentContainerTag: 'span',
      rdfaContainerTag: 'span',
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
      context: 'article/article_body/',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (
          hasOutgoingNamedNodeTriple(
            rdfaAttrs,
            RDF('type'),
            SAY('Paragraph'),
          ) &&
          hasRdfaContentChild(element)
        ) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
    // Older structures (without an explicit 'content' element) don't have a separate element
    // around the paragraph number, so we manually create that to use as a content element
    {
      tag: 'div',
      context: 'article/article_body/',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
        if (
          hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), SAY('Paragraph'))
        ) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          throw new Error('content element is not an element');
        }
        let contentElem = node as HTMLElement;
        if (
          contentElem.lastElementChild &&
          hasRDFaAttribute(
            contentElem.lastElementChild,
            'property',
            SAY('body'),
          )
        ) {
          const bodyElem = contentElem.lastElementChild;
          const headingSpan = document.createElement('span');
          const children = [...contentElem.childNodes];
          // Just in case there's a non-element child after the body
          let child: Node | undefined;
          do {
            child = children.pop();
          } while (child && child.nodeType !== Node.ELEMENT_NODE);
          headingSpan.replaceChildren(...children);

          contentElem = document.createElement('div');
          contentElem.replaceChildren(headingSpan, bodyElem);
        }

        return contentElem;
      },
    },
    // Parsing rule for backwards compatibility (when content was not inside seperate say:body div)
    {
      tag: 'div',
      context: 'article/article_body/',
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
            subject: element.getAttribute('resource'),
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
