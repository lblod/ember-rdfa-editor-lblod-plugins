import {
  EditorState,
  NodeSpec,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { SpecName, StructureSpec } from '..';
import { v4 as uuid } from 'uuid';

export default function constructStructureType(config: {
  name: SpecName;
  type: string;
  resourcePrefix: string;
  context: SpecName[];
  content: string;
  continuous: boolean;
  titlePlaceholder: string;
  contentPlaceholder: string;
  numberingFunction: (n: number) => string;
}): {
  structureSpec: StructureSpec;
  nodeSpecs: Record<string, NodeSpec>;
} {
  const {
    name,
    type,
    resourcePrefix,
    context,
    content,
    continuous,
    titlePlaceholder,
    contentPlaceholder,
    numberingFunction,
  } = config;

  const structureSpec: StructureSpec = {
    name,
    context,
    continuous,
    constructor: (schema: Schema, number: number) => {
      const numberConverted = numberingFunction(number);
      const node = schema.node(
        `${name}`,
        { resource: resourcePrefix + uuid() },
        [
          schema.node(
            'structure_header',
            { level: 4, number: numberConverted },
            schema.node('placeholder', {
              placeholderText: titlePlaceholder,
            })
          ),
          schema.node(`${name}_content`, {}, [
            schema.node(
              'paragraph',
              {},
              schema.node('placeholder', {
                placeholderText: contentPlaceholder,
              })
            ),
          ]),
        ]
      );
      return node;
    },
    updateNumber: (number: number, pos: number, transaction: Transaction) => {
      const numberConverted = numberingFunction(number);
      return transaction.setNodeAttribute(pos + 1, 'number', numberConverted);
    },
    content: (pos: number, state: EditorState) => {
      const node = unwrap(state.doc.nodeAt(pos));
      return node.child(1).content;
    },
  };

  const structureNodeSpec: NodeSpec = {
    group: 'block',
    content: `structure_header ${name}_content`,
    inline: false,
    attrs: {
      resource: {},
    },
    toDOM(node) {
      return [
        'div',
        {
          property: 'say:hasPart',
          typeof: `${type} https://say.data.gift/ns/ArticleContainer`,
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
            element.getAttribute('typeof')?.includes(type) &&
            element.getAttribute('resource')
          ) {
            return { resource: element.getAttribute('resource') };
          }
          return false;
        },
      },
    ],
  };

  const contentNodeSpec: NodeSpec = {
    content,
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
  return {
    structureSpec,
    nodeSpecs: {
      [name]: structureNodeSpec,
      [`${name}_content`]: contentNodeSpec,
    },
  };
}
