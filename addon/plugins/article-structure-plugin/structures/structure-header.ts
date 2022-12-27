import { NodeSpec } from '@lblod/ember-rdfa-editor';
import { getStructureHeaderAttrs } from '../utils';

const TAG_TO_LEVEL = new Map([
  ['h1', 1],
  ['h2', 2],
  ['h3', 3],
  ['h4', 4],
  ['h5', 5],
  ['h6', 6],
  ['span', 6],
]);

export const structure_header: NodeSpec = {
  content: 'text*|placeholder',
  inline: false,
  attrs: {
    property: {
      default: 'say:heading',
    },

    number: {
      default: '1',
    },
    level: {
      default: 1,
    },
  },
  toDOM(node) {
    return [
      `h${node.attrs.level as number}`,
      { property: node.attrs.property as string },
      [
        'span',
        { property: 'eli:number', datatype: 'xsd:string' },
        node.attrs.number,
      ],
      '. ',
      [
        'span',
        {
          property: 'ext:title',
        },
        0,
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'h1,h2,h3,h4,h5,h6,span',
      getAttrs(element: HTMLElement) {
        const level = TAG_TO_LEVEL.get(element.tagName) ?? 6;
        const headerAttrs = getStructureHeaderAttrs(element);
        if (headerAttrs) {
          return { level, ...headerAttrs };
        }
        return false;
      },
      contentElement: `span[property='ext:title']`,
    },
  ],
};
