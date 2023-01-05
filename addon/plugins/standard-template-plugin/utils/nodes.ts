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
  content: '(paragraph|heading|bullet_list)*',
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
  content: 'besluitArticle*',
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
        if (
          element.getAttribute('property') === 'prov:value' &&
          element.parentElement
            ?.getAttribute('typeof')
            ?.includes('besluit:Besluit')
        ) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const besluitArticle: NodeSpec = {
  group: 'block',
  content: 'besluitArticleHeader{1}(languageNode*)besluitArticleContent{1}',
  inline: false,
  attrs: {
    property: {
      default: 'eli:has_part',
    },
    typeof: {
      default: 'besluit:Artikel',
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
          element.getAttribute('property') === 'eli:has_part' &&
          element.getAttribute('typeof') === 'besluit:Artikel'
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};

export const besluitArticleHeader: NodeSpec = {
  group: 'block',
  content: 'text*besluitArticleNumber{1}',
  inline: false,
  attrs: {},
  toDOM() {
    return ['div', {}, 0];
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          element.parentElement?.getAttribute('typeof') === 'besluit:Artikel' &&
          element.getAttribute('property') !== 'prov:value'
        ) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const besluitArticleNumber: NodeSpec = {
  group: 'inline',
  content: 'text*',
  inline: true,
  attrs: {
    property: {
      default: 'eli:number',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return [
      'span',
      {
        property: node.attrs.property as string,
        datatype: node.attrs.datatype as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(element: HTMLElement) {
        if (
          element.getAttribute('property') === 'eli:number' &&
          element.parentElement?.getAttribute('typeof') === 'besluit:Artikel'
        ) {
          return {};
        }
        return false;
      },
    },
  ],
};

export const besluitArticleContent: NodeSpec = {
  group: 'block',
  content: 'text*',
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
        if (
          element.getAttribute('property') === 'prov:value' &&
          element.parentElement?.getAttribute('typeof') === 'besluit:Artikel'
        ) {
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
    '(paragraph|heading|languageNode)*title{1}(paragraph|heading|languageNode)*description{1}(paragraph|heading|languageNode)*motivering{1}(paragraph|heading|languageNode)*articleContainer{1}(paragraph|heading|languageNode)*',
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
            ?.includes('besluit:Besluit ext:BesluitNieuweStijl')
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};

export const languageNode: NodeSpec = {
  group: 'block',
  content: '',
  inline: false,
  attrs: {
    style: {
      default: 'style="display:none;"',
    },
    property: {
      default: 'eli:language',
    },
    typeof: {
      default: 'skos:Concept',
    },
    resource: {},
  },
  toDOM(node) {
    return [
      'span',
      {
        property: node.attrs.property as string,
        typeof: node.attrs.typeof as string,
        resource: node.attrs.resource as string,
        style: node.attrs.style as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(element: HTMLElement) {
        if (
          element.getAttribute('property') === 'eli:language' &&
          element.getAttribute('typeof') === 'skos:Concept'
        ) {
          return { resource: element.getAttribute('resource') };
        }
        return false;
      },
    },
  ],
};
