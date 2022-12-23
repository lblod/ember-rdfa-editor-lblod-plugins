import { NodeSpec } from '@lblod/ember-rdfa-editor';

export const structure_header: NodeSpec = {
  content: 'text*|placeholder',
  inline: false,
  attrs: {
    number: {
      default: '1',
    },
    level: {
      default: 1,
    },
    placeholder: {
      default: '',
    },
  },
  toDOM(node) {
    return [
      `h${node.attrs.level as number}`,
      { property: 'say:heading' },
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
          'data-placeholder': node.attrs.placeholder as string,
        },
        0,
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'h1, h2, h3, h4, h5, h6',
      getAttrs(element: HTMLElement) {
        const numberNode = element.children[0];
        if (
          element.getAttribute('property') === 'say:heading' &&
          numberNode &&
          numberNode.getAttribute('property') === 'eli:number'
        ) {
          return {
            number: numberNode.textContent,
          };
        }
        return false;
      },
      contentElement: `span[property='ext:title']`,
    },
  ],
};
