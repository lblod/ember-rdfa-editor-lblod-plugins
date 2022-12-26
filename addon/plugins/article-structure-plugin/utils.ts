import { NodeSpec, NodeType, Selection } from '@lblod/ember-rdfa-editor';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';

export function constructStructureNodeSpec(config: {
  type: string;
  content: string;
}): NodeSpec {
  const { content, type } = config;
  return {
    group: 'block',
    content,
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
}

export function constructStructureBodyNodeSpec(config: {
  content: string;
}): NodeSpec {
  const { content } = config;
  return {
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
}

export function findAncestorOfType(selection: Selection, ...types: NodeType[]) {
  const parent = findParentNodeOfType(types)(selection);
  if (parent) {
    return parent;
  }
  if (types.includes(selection.$from.doc.type)) {
    return {
      node: selection.$from.doc,
      pos: -1,
      depth: 0,
    };
  }
  return;
}
