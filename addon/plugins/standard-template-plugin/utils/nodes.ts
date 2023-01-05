import { NodeSpec } from '@lblod/ember-rdfa-editor';

export const title: NodeSpec = {
  group: 'block',
  content: 'text*|placeholder',
  inline: false,
  attrs: {
    property: {
      default: 'eli:title',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'h4',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'h4',
      getAttrs(element: HTMLElement) {
        if (element.getAttribute('property') === 'eli:title') {
          return {};
        }
        return false;
      },
    },
  ],
};

export const description: NodeSpec = {
  group: 'block',
  content: 'text*|placeholder',
  inline: false,
  attrs: {
    property: {
      default: 'eli:description',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'p',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'p',
      getAttrs(element: HTMLElement) {
        if (element.getAttribute('property') === 'eli:description') {
          return {};
        }
        return false;
      },
    },
  ],
};

export const motivering: NodeSpec = {
  group: 'block',
  content: '(paragraph|heading|bullet_list)*', //Content to be determined
  inline: false,
  attrs: {
    property: {
      default: 'besluit:motivering',
    },
    lang: {
      default: 'nl',
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        lang: node.attrs.lang as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (element.getAttribute('property') === 'besluit:motivering') {
          return {};
        }
        return false;
      },
    },
  ],
};

export const articleContainer: NodeSpec = {
  group: 'block',
  content: 'paragraph',
  inline: false,
  attrs: {
    property: {
      default: 'prov:value',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (element.getAttribute('property') === 'prov:value') {
          return {};
        }
        return false;
      },
    },
  ],
};

export const besluit: NodeSpec = {
  group: 'block',
  content:
    '(paragraph|heading)*title{1}(paragraph|heading)*description{1}(paragraph|heading)*motivering{1}(paragraph|heading)*articleContainer{1}(paragraph|heading)*',
  inline: false,
  attrs: {
    property: {
      default: 'prov:generated',
    },
    typeof: {
      default: 'besluit:Besluit ext:BesluitNieuweStijl',
    },
    resource: {},
  },
  toDOM(node) {
    return [
      'div',
      {
        property: node.attrs.property as string,
        typeof: node.attrs.typeof as string,
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
          element.getAttribute('property') === 'prov:generated' &&
          element.getAttribute('typeof') &&
          element
            .getAttribute('typeof')
            .includes('besluit:Besluit ext:BesluitNieuweStijl')
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};
