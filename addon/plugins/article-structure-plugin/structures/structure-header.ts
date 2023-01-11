import { NodeSpec } from '@lblod/ember-rdfa-editor';
import {
  ELI,
  EXT,
  SAY,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getStructureHeaderAttrs } from '../utils/structure';

const TAG_TO_LEVEL = new Map([
  ['h1', 1],
  ['h2', 2],
  ['h3', 3],
  ['h4', 4],
  ['h5', 5],
  ['h6', 6],
]);

export const structure_header: NodeSpec = {
  content: 'text*|placeholder',
  inline: false,
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
  toDOM(node) {
    return [
      `h${node.attrs.level as number}`,
      { property: node.attrs.property as string },
      [
        'span',
        { property: ELI('number').prefixed, datatype: XSD('string').prefixed },
        node.attrs.number,
      ],
      '. ',
      [
        'span',
        {
          property: EXT('title').prefixed,
        },
        0,
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'h1,h2,h3,h4,h5,h6,span',
      getAttrs(element: HTMLElement) {
        const level = TAG_TO_LEVEL.get(element.tagName.toLowerCase()) ?? 6;
        const headerAttrs = getStructureHeaderAttrs(element);
        if (headerAttrs) {
          return { level, ...headerAttrs };
        }

        return false;
      },
      contentElement: `span[property~='${EXT('title').prefixed}'], 
                       span[property~='${EXT('title').full}']`,
    },
  ],
};
