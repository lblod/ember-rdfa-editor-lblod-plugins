import { Fragment, NodeSpec } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import { v4 as uuid } from 'uuid';
import {
  ELI,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import {
  getNumberAttributeFromElement,
  getNumberAttributesFromNode,
  getNumberDocSpecFromNode,
  getNumberUtils,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';

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
  constructor: ({ schema, number, intl, state }) => {
    const translationWithDocLang = getTranslationFunction(state);
    const node = schema.node(
      `article_paragraph`,
      {
        resource: `http://data.lblod.info/paragraphs/${uuid()}`,
        number,
      },
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
    );
    return { node, selectionConfig: { relativePos: 1, type: 'node' } };
  },
  ...getNumberUtils(),
};

const contentSelector = `span[property~='${SAY('body').prefixed}'],
                         span[property~='${SAY('body').full}']`;

export const article_paragraph: NodeSpec = {
  content: 'block*',
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
      default: 1,
    },
    numberDisplayStyle: {
      default: 'decimal', // decimal, roman
    },
    startNumber: {
      default: null,
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        typeof: node.attrs.typeof as string,
        resource: node.attrs.resource as string,
        ...getNumberAttributesFromNode(node),
      },
      ['span', { contenteditable: false }, '§'],
      getNumberDocSpecFromNode(node),
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
          const numberAttributes = getNumberAttributeFromElement(
            element,
            numberSpan,
          );

          return {
            resource: element.getAttribute('resource'),
            ...numberAttributes,
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
