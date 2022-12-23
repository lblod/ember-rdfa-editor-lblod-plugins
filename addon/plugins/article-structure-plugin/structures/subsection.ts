import {
  EditorState,
  NodeSpec,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { StructureSpec } from '..';

export const subsectionStructure: StructureSpec = {
  name: 'subsection',
  context: ['section_content'],
  continuous: false,
  constructor: (schema: Schema) => {
    const sectionNode = schema.node(
      'subsection',
      { resource: 'http://section' },
      [
        schema.node(
          'structure_header',
          { number: 1, level: 5 },
          schema.node('placeholder', {
            placeholderText: 'Insert subsection title',
          })
        ),
        schema.node('subsection_content', {}, [
          schema.node(
            'paragraph',
            {},
            schema.node('placeholder', {
              placeholderText: 'Insert subsection content',
            })
          ),
        ]),
      ]
    );
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

export const subsection: NodeSpec = {
  content: 'structure_header subsection_content',
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
          'https://say.data.gift/ns/Subsection https://say.data.gift/ns/ArticleContainer',
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
            ?.includes('https://say.data.gift/ns/Subsection') &&
          element.getAttribute('resource')
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};

export const subsection_content: NodeSpec = {
  content: 'paragraph',
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
