import {
  DOMOutputSpec,
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
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasRDFaAttribute,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import {
  romanize,
  romanToInt,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/romanize';

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
    attrs: {
      property: {
        default: SAY('hasPart').prefixed,
      },
      typeof: {
        default: type.prefixed,
      },
      resource: {},
    },
    allowSplitByTable: config.allowSplitByTable,
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
  allowSplitByTable?: boolean;
}): NodeSpec {
  const { content } = config;
  return {
    content,
    inline: false,
    defining: true,
    isolating: true,
    allowSplitByTable: config.allowSplitByTable,
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

export function getNumberAttributeFromElement(
  containerElement: Element,
  numberElement: Element,
): {
  number: string;
  numberDisplayStyle: string;
} {
  // Storing the number in the content attribute was not introduced straight away,
  // so we need to check for both the content attribute and the textContent.
  const contentAttribute = numberElement.getAttribute('content');

  // If the content attribute is present, we can assume it is the correct number.
  if (contentAttribute) {
    return {
      number: contentAttribute,
      ...getNodeNumberAttrsFromElement(containerElement),
    };
  }

  const textContentNumber = numberElement.textContent;

  if (!textContentNumber) {
    return { number: '1', ...getNodeNumberAttrsFromElement(containerElement) };
  }

  // If the textContent is a number, we can assume it is the correct number.
  if (/^[0-9]+$/.exec(textContentNumber)) {
    return {
      number: textContentNumber,
      ...getNodeNumberAttrsFromElement(containerElement),
    };
  }

  // Otherwise, we assume it is a roman number.
  return {
    number: `${romanToInt(textContentNumber)}`,
    ...getNodeNumberAttrsFromElement(containerElement),
    numberDisplayStyle: 'roman',
  };
}

export function getStructureHeaderAttrs(element: HTMLElement) {
  const numberElement = element.querySelector(
    `[property~="${ELI('number').prefixed}"],
     [property~="${ELI('number').full}"]`,
  );

  if (hasRDFaAttribute(element, 'property', SAY('heading')) && numberElement) {
    return getNumberAttributeFromElement(element, numberElement);
  }

  return false;
}

export function containsOnlyPlaceholder(schema: Schema, node: PNode) {
  return (
    node.childCount === 1 &&
    node.firstChild?.type === schema.nodes['paragraph'] &&
    node.firstChild.firstChild?.type === schema.nodes['placeholder']
  );
}

export const getNumberAttributesFromNode = (node: PNode) => ({
  ['data-start-number']: node.attrs.startNumber
    ? `${node.attrs.startNumber}`
    : null,
  ['data-number-display-style']: node.attrs.numberDisplayStyle as string,
});

export const getNumberDocSpecFromNode = (node: PNode): DOMOutputSpec => [
  'span',
  {
    property: ELI('number').prefixed,
    datatype: XSD('string').prefixed,
    content: node.attrs.number as string,
    contenteditable: false,
  },
  node.attrs.numberDisplayStyle === 'roman'
    ? romanize(node.attrs.number ?? '1')
    : node.attrs.number,
];

const getNodeNumberAttrsFromElement = (element: Element) => {
  const startNumber = element.getAttribute('data-start-number');
  const numberDisplayStyle = element.getAttribute('data-number-display-style');

  return {
    numberDisplayStyle: numberDisplayStyle ?? 'decimal',
    startNumber: startNumber ?? null,
  };
};

export const getNumberUtils = (
  // Offset for the position of the node where the starting number is stored.
  // For structures with `structure_header` it will usually be +1,
  // for `articleParagraph` it is 0.
  offset = 0,
): Pick<
  StructureSpec,
  'setStartNumber' | 'getStartNumber' | 'getNumber' | 'updateNumber'
> => ({
  updateNumber: ({ number, pos, transaction }) => {
    const numberConverted = number.toString();
    return transaction.setNodeAttribute(
      pos + offset,
      'number',
      numberConverted,
    );
  },
  getNumber: ({ pos, transaction }) => {
    const node = unwrap(transaction.doc.nodeAt(pos + offset));
    const number = node.attrs.number as string | undefined | null;

    if (typeof number === 'string' && number.length > 0) {
      return parseInt(number, 10);
    }

    return null;
  },
  getStartNumber: ({ pos, transaction }) => {
    const node = unwrap(transaction.doc.nodeAt(pos + offset));
    const startNumber = node.attrs.startNumber as number | undefined | null;

    if (typeof startNumber === 'number') {
      return startNumber;
    }

    return null;
  },
  setStartNumber: ({ number, pos, transaction }) =>
    transaction.setNodeAttribute(pos + offset, 'startNumber', number),
});
