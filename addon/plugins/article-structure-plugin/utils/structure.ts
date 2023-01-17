import {
  NodeSpec,
  NodeType,
  PNode,
  Schema,
  Selection,
} from '@lblod/ember-rdfa-editor';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import {
  ELI,
  RDF,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasRDFaAttribute,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { StructureSpec } from '..';

export function constructStructureNodeSpec(config: {
  type: Resource;
  content: string;
  group?: string;
}): NodeSpec {
  const { group, content, type } = config;
  return {
    group,
    content,
    draggable: true,
    selectable: true,
    inline: false,
    attrs: {
      property: {
        default: SAY('hasPart').prefixed,
      },
      typeof: {
        default: type.prefixed,
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
            hasRDFaAttribute(element, 'property', SAY('hasPart')) &&
            hasRDFaAttribute(element, 'typeof', type) &&
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
      return [
        'div',
        {
          property: SAY('body').prefixed,
          datatype: RDF('XMLLiteral').prefixed,
        },
        0,
      ];
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
     [property~="${ELI('number').full}"]`
  );
  if (hasRDFaAttribute(element, 'property', SAY('heading')) && numberNode) {
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

export function getContinuousStructureSpecs(structureSpecs: StructureSpec[]) {
  return structureSpecs.filter((spec) => spec.continuous);
}
