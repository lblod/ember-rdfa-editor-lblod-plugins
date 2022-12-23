import {
  EditorState,
  NodeSpec,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { StructureSpec } from '..';

export const sectionStructure: StructureSpec = {
  name: 'section',
  context: ['chapter_content'],
  continuous: false,
  constructor: (schema: Schema) => {
    const sectionNode = schema.node('section', { resource: 'http://section' }, [
      schema.node(
        'structure_header',
        { number: 1, level: 5 },
        schema.node('placeholder', { placeholderText: 'Insert section title' })
      ),
      schema.node('section_content', {}, [
        schema.node(
          'paragraph',
          {},
          schema.node('placeholder', {
            placeholderText: 'Insert section content',
          })
        ),
      ]),
    ]);
    return sectionNode;
  },
  updateNumber: (number: number, pos: number, transaction: Transaction) => {
    const numberConverted = romanize(number);
    return transaction.setNodeAttribute(pos + 1, 'number', numberConverted);
  },
  content: (pos: number, state: EditorState) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return node.child(1).content;
  },
};

export const section: NodeSpec = {
  content: 'structure_header section_content',
  inline: false,
  attrs: {
    resource: {},
  },
  toDOM(node) {
    return [
      'div',
      {
        property: 'say:hasPart',
        typeof:
          'https://say.data.gift/ns/Section https://say.data.gift/ns/ArticleContainer',
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
          element.getAttribute('property') === 'say:hasPart' &&
          element
            .getAttribute('typeof')
            ?.includes('https://say.data.gift/ns/Section') &&
          element.getAttribute('resource')
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};

export const section_content: NodeSpec = {
  content: '(subsection|paragraph)+',
  inline: false,
  toDOM() {
    return ['div', { property: 'say:body', datatype: 'rdf:XMLLiteral' }, 0];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          element.getAttribute('property') === 'say:body' &&
          element.getAttribute('datatype') === 'rdf:XMLLiteral'
        ) {
          return {};
        }
        return false;
      },
    },
  ],
};
