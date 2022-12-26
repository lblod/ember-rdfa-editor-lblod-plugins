import { NodeSpec } from '@lblod/ember-rdfa-editor';

function getStructureHeaderAttrs(element: HTMLElement) {
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
}
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
      tag: 'h1',
      getAttrs(element: HTMLElement) {
        const headerAttrs = getStructureHeaderAttrs(element);
        if (headerAttrs) {
          return { level: 1, ...headerAttrs };
        }
        return false;
      },
      contentElement: `span[property='ext:title']`,
    },
    {
      tag: 'h2',
      getAttrs(element: HTMLElement) {
        const headerAttrs = getStructureHeaderAttrs(element);
        if (headerAttrs) {
          return { level: 2, ...headerAttrs };
        }
        return false;
      },
      contentElement: `span[property='ext:title']`,
    },
    {
      tag: 'h3',
      getAttrs(element: HTMLElement) {
        const headerAttrs = getStructureHeaderAttrs(element);
        if (headerAttrs) {
          return { level: 3, ...headerAttrs };
        }
        return false;
      },
      contentElement: `span[property='ext:title']`,
    },
    {
      tag: 'h4',
      getAttrs(element: HTMLElement) {
        const headerAttrs = getStructureHeaderAttrs(element);
        if (headerAttrs) {
          return { level: 4, ...headerAttrs };
        }
        return false;
      },
      contentElement: `span[property='ext:title']`,
    },
    {
      tag: 'h5',
      getAttrs(element: HTMLElement) {
        const headerAttrs = getStructureHeaderAttrs(element);
        if (headerAttrs) {
          return { level: 5, ...headerAttrs };
        }
        return false;
      },
      contentElement: `span[property='ext:title']`,
    },
  ],
};
