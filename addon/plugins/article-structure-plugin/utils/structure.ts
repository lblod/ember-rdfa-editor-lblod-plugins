import type { DOMOutputSpec } from 'prosemirror-model';
import {
  NodeSpec,
  NodeType,
  PNode,
  rdfaAttrSpec,
  Schema,
  Selection,
} from '@lblod/ember-rdfa-editor';
import {
  getRdfaAttrs,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import {
  ELI,
  EXT,
  RDF,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasBacklink,
  hasParsedRDFaAttribute,
  hasRDFaAttribute,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export function constructStructureNodeSpec(config: {
  type: Resource;
  content: string;
  group?: string;
  allowSplitByTable?: boolean;
}): NodeSpec {
  const { group, content, type } = config;
  return {
    group,
    content,
    inline: false,
    editable: true,
    isolating: true,
    attrs: {
      ...rdfaAttrSpec,
      typeof: {
        default: type.prefixed,
      },
      resource: {},
    },
    allowSplitByTable: config.allowSplitByTable,
    toDOM(node) {
      return renderRdfaAware({
        renderable: node,
        tag: 'div',
        attrs: {
          ...node.attrs,
          class: 'say-editable',
        },
        content: 0,
      });
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(element: HTMLElement) {
          const rdfaAttrs = getRdfaAttrs(element);
          if (hasParsedRDFaAttribute(rdfaAttrs, RDF('type'), type)) {
            return rdfaAttrs;
          }
          return false;
        },
      },
    ],
  };
}

export function constructStructureBodyNodeSpec(config: {
  content: string;
  allowSplitByTable?: boolean;
}): NodeSpec {
  const { content } = config;
  return {
    content,
    inline: false,
    defining: true,
    editable: true,
    isolating: true,
    allowSplitByTable: config.allowSplitByTable,
    attrs: rdfaAttrSpec,
    toDOM(node) {
      return renderRdfaAware({
        renderable: node,
        tag: 'div',
        attrs: {
          ...node.attrs,
          class: 'say-editable',
          property: SAY('body').prefixed,
          datatype: RDF('XMLLiteral').prefixed,
        },
        content: 0,
      });
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(element: HTMLElement) {
          if (
            hasRDFaAttribute(element, 'property', SAY('body')) &&
            hasRDFaAttribute(element, 'datatype', RDF('XMLLiteral'))
          ) {
            return {};
          }
          return false;
        },
        contentElement: 'div[data-content-container="true"]',
      },
    ],
  };
}

const TAG_TO_LEVEL = new Map([
  ['h1', 1],
  ['h2', 2],
  ['h3', 3],
  ['h4', 4],
  ['h5', 5],
  ['h6', 6],
]);

type StructureHeaderArgs = {
  outlineText: (node: PNode) => string;
  numberContentDOM: (number: number | string) => DOMOutputSpec[];
  includeLevel: boolean;
};

export function constructStructureHeaderNodeSpec({
  outlineText,
  numberContentDOM,
  includeLevel,
}: StructureHeaderArgs): NodeSpec {
  return {
    content: 'structure_header_title',
    inline: false,
    defining: true,
    isolating: true,
    editable: true,
    selectable: false,
    allowSplitByTable: false,
    attrs: {
      ...rdfaAttrSpec,
      property: {
        default: SAY('heading').prefixed,
      },
      number: {
        default: '1',
      },
      ...(includeLevel
        ? {
            level: {
              default: 1,
            },
          }
        : {}),
    },
    outlineText,
    toDOM(node) {
      const { level, ...attrs } = node.attrs;
      return renderRdfaAware({
        renderable: node,
        tag: includeLevel ? `h${level as number}` : 'span',
        rdfaContainerTag: 'span',
        contentContainerTag: 'span',
        attrs: {
          ...attrs,
          ...(includeLevel ? { level: level as number } : {}),
        },
        contentArray: [...numberContentDOM(attrs.number), ['span', {}, 0]],
      });
    },
    parseDOM: [
      {
        tag: 'h1,h2,h3,h4,h5,h6,span',
        // Need to have higher priority than default (50) as otherwise seems to get parsed as a
        // generic header
        priority: 60,
        getAttrs(element: HTMLElement) {
          const level = TAG_TO_LEVEL.get(element.tagName.toLowerCase()) ?? 6;
          const rdfaAttrs = getRdfaAttrs(element);
          if (hasBacklink(rdfaAttrs, SAY('heading'))) {
            const titleChild = element.querySelector(`
              span[property~='${EXT('title').prefixed}'],
              span[property~='${EXT('title').full}']`);
            if (titleChild) {
              return { level, ...rdfaAttrs };
            }
          }

          return false;
        },
        contentElement: (node) => {
          return ((node as HTMLElement)?.querySelector(
            '[data-content-container="true"]',
          )?.lastElementChild ?? node) as HTMLElement;
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
      start: 0,
      depth: 0,
    };
  }
  return;
}

export function getStructureHeaderAttrs(element: HTMLElement) {
  const numberNode = element.querySelector(
    `[property~="${ELI('number').prefixed}"],
     [property~="${ELI('number').full}"]`,
  );
  if (numberNode) {
    return {
      number: numberNode.textContent,
    };
  }
  return false;
}

export function romanize(num: number) {
  if (isNaN(num)) throw new Error('Provided number is NaN');
  const digits = String(+num).split('');
  const key = [
    '',
    'C',
    'CC',
    'CCC',
    'CD',
    'D',
    'DC',
    'DCC',
    'DCCC',
    'CM',
    '',
    'X',
    'XX',
    'XXX',
    'XL',
    'L',
    'LX',
    'LXX',
    'LXXX',
    'XC',
    '',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
  ];
  let roman = '';
  let i = 3;
  while (i--) {
    const digit = digits.pop();
    if (digit) {
      roman = (key[Number(digit) + i * 10] || '') + roman;
    }
  }
  return Array(+digits.join('') + 1).join('M') + roman;
}

export function containsOnlyPlaceholder(schema: Schema, node: PNode) {
  return (
    node.childCount === 1 &&
    node.firstChild?.type === schema.nodes['paragraph'] &&
    node.firstChild.firstChild?.type === schema.nodes['placeholder']
  );
}
