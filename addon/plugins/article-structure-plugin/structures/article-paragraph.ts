import { Fragment, NodeSpec, RdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { StructureSpec } from '..';
import { v4 as uuid } from 'uuid';
import {
  ELI,
  RDF,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasParsedRDFaAttribute,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { constructStructureBodyNodeSpec } from '../utils/structure';

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
  relationshipPredicate: SAY('hasParagraph'),
  constructor: ({ schema, number, intl, state }) => {
    const numberConverted = number?.toString() ?? '1';
    const translationWithDocLang = getTranslationFunction(state);
    const paragraphRdfaId = uuid();
    const numberRdfaId = uuid();
    const bodyRdfaId = uuid();
    const resource = `http://data.lblod.info/paragraphs/${paragraphRdfaId}`;
    const paragraphAttrs: RdfaAttrs = {
      __rdfaId: paragraphRdfaId,
      rdfaNodeType: 'resource',
      resource,
      properties: [
        {
          type: 'external',
          predicate: ELI('number').prefixed,
          object: { type: 'literal', rdfaId: numberRdfaId },
        },
        {
          type: 'external',
          predicate: SAY('body').prefixed,
          object: { type: 'literal', rdfaId: bodyRdfaId },
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
          subject: resource,
        },
      ],
    };
    const bodyAttrs: RdfaAttrs = {
      __rdfaId: bodyRdfaId,
      rdfaNodeType: 'literal',
      backlinks: [
        {
          predicate: SAY('body').prefixed,
          subject: resource,
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
    ]);
    return {
      node,
      selectionConfig: { rdfaId: bodyRdfaId, type: 'node' },
      newResource: resource,
    };
  },
  updateNumber: {
    convertNumber: (number) => number.toString(),
  },
};

export const article_paragraph_body = constructStructureBodyNodeSpec({
  tag: 'span',
  content: 'block*',
  context: 'article_paragraph/',
});

export const article_paragraph_number: NodeSpec = {
  content: 'text* structure_header_number text*',
  inline: false,
  editable: false,
  toDOM(node) {
    return ['span', node.attrs, 0];
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
    ...rdfaAttrSpec,
    typeof: {
      default: SAY('Paragraph').prefixed,
    },
    number: {
      default: '1',
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
        const rdfaAttrs = getRdfaAttrs(element);
        if (hasParsedRDFaAttribute(rdfaAttrs, RDF('type'), SAY('Paragraph'))) {
          return rdfaAttrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
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
