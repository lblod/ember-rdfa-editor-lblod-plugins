import {
  NodeSpec,
  Schema,
  Transaction,
  EditorState,
} from '@lblod/ember-rdfa-editor';
import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { StructureSpec } from '..';

export const chapterStructure: StructureSpec = {
  name: 'chapter',
  context: ['doc'],
  continuous: false,
  constructor: (schema: Schema, number: number) => {
    const numberConverted = romanize(number);
    const chapterNode = schema.node('chapter', { resource: 'http://chapter' }, [
      schema.node(
        'structure_header',
        { level: 4, number: numberConverted },
        schema.node('placeholder', { placeholderText: 'Insert chapter title' })
      ),
      schema.node('chapter_content', {}, [
        schema.node(
          'paragraph',
          {},
          schema.node('placeholder', {
            placeholderText: 'Insert chapter content',
          })
        ),
      ]),
    ]);
    return chapterNode;
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

export const chapter: NodeSpec = {
  group: 'block',
  content: 'structure_header chapter_content',
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
          'https://say.data.gift/ns/Chapter https://say.data.gift/ns/ArticleContainer',
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
            ?.includes('https://say.data.gift/ns/Chapter') &&
          element.getAttribute('resource')
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};

export const chapter_content: NodeSpec = {
  content: '(section|paragraph)+',
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

// const chapterNodeConfig: EmberNodeConfig = {
//   name: 'chapter',
//   componentPath: 'article-structure-plugin/ember-nodes/article-structure',
//   group: 'block',
//   inline: false,
//   content: '(section|block)+',
//   atom: false,
//   attrs: {
//     resource: {},
//     property: {
//       default: 'say:hasPart',
//     },
//     typeof: {
//       default: 'say:Chapter say:ArticleContainer',
//     },
//     titlePlaceholder: {
//       default: 'Insert chapter title',
//     },
//     title: {
//       default: '',
//     },
//   },
//   toDOM: (node: PNode) => {
//     return [
//       'div',
//       {
//         property: node.attrs.property as string,
//         typeof: node.attrs.typeof as string,
//         resource: node.attrs.resource as string,
//       },
//       [
//         `h4`,
//         { property: 'say:heading' },
//         [
//           'span',
//           { property: 'eli:number', datatype: 'xsd:string' },
//           node.attrs.number as number,
//         ],
//         '. ',
//         [
//           'span',
//           {
//             property: 'ext:title',
//           },
//           node.attrs.title as string,
//         ],
//       ],
//     ];
//   },
// };

// export const chapter = createEmberNodeSpec(chapterNodeConfig);

// export const chapterView = createEmberNodeView(chapterNodeConfig);
