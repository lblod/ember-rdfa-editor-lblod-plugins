import { NodeSpec, PNode, RdfaAttrs, Schema } from '@lblod/ember-rdfa-editor';
import {
  EXT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

const TAG_TO_LEVEL = new Map([
  ['h1', 1],
  ['h2', 2],
  ['h3', 3],
  ['h4', 4],
  ['h5', 5],
  ['h6', 6],
]);

export const structure_header: NodeSpec = {
  content: 'structure_header_title',
  inline: false,
  defining: true,
  isolating: true,
  selectable: false,
  allowSplitByTable: false,
  attrs: {
    property: {
      default: SAY('heading').prefixed,
    },
    number: {
      default: '1',
    },
    level: {
      default: 1,
    },
  },
  outlineText: (node: PNode) => {
    const { number } = node.attrs;
    return `${number as string}. ${node.textContent}`;
  },
  toDOM(node) {
    return [
      `h${node.attrs.level as number}`,
      {
        level: node.attrs.level as number,
        property: node.attrs.property as string,
      },
      [
        'span',
        {
          contenteditable: false,
        },
        node.attrs.number,
      ],
      ['span', { contenteditable: false }, '. '],
      ['span', {}, 0],
    ];
  },
  parseDOM: [
    {
      tag: 'h1,h2,h3,h4,h5,h6',
      priority: 60,
      getAttrs(element: HTMLElement) {
        const level = TAG_TO_LEVEL.get(element.tagName.toLowerCase()) ?? 6;
        const property = element.getAttribute('property');
        if (property === SAY('heading').prefixed) {
          return { level };
        }

        return false;
      },
      contentElement: (node) => node.lastChild as HTMLElement,
    },
  ],
};

type ConstructArgs = {
  schema: Schema;
  backlinkResource: string;
  titleRdfaId: string;
  titleText: string;
  level: number;
  number?: string;
  headingProperty?: string;
};
export function constructStructureHeader({
  schema,
  backlinkResource,
  titleRdfaId,
  titleText,
  level,
  number,
  headingProperty,
}: ConstructArgs) {
  const titleAttrs: RdfaAttrs = {
    __rdfaId: titleRdfaId,
    rdfaNodeType: 'literal',
    backlinks: [
      {
        subject: backlinkResource,
        predicate: EXT('title').prefixed,
      },
    ],
  };
  return schema.node(
    'structure_header',
    { level, number, property: headingProperty },
    schema.node('structure_header_title', titleAttrs, schema.text(titleText)),
  );
}
