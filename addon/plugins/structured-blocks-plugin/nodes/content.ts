import { NodeSpec } from '@lblod/ember-rdfa-editor';

export const content: NodeSpec = {
  inline: false,
  group: 'content structure',
  content: 'block+',
  draggable: false,
  isolating: true,
  defining: true,
  selectable: false,
  toDOM() {
    return [
      'div',
      {
        'data-structure': 'content',
        class: 'au-u-11-12 border au-c-textarea content-area',
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (element.dataset.structure === 'content') {
          return {};
        }
        return false;
      },
    },
  ],
};
