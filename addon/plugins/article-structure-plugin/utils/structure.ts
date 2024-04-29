import {
  Attrs,
  NodeSpec,
  NodeType,
  PNode,
  rdfaAttrSpec,
  Schema,
  Selection,
} from '@lblod/ember-rdfa-editor';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  hasRdfaContentChild,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import {
  EXT,
  RDF,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasBacklink,
  hasOutgoingNamedNodeTriple,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { StructureSpec } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { romanize } from './romanize';

const rdfaAware = true;
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
      ...rdfaAttrSpec({ rdfaAware }),
      rdfaNodeType: {
        default: 'resource',
      },
      typeof: {
        default: type.prefixed,
      },
      subject: {},
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
        preserveWhitespace: false,
        getAttrs(element: HTMLElement) {
          const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
          if (
            hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), type) &&
            hasRdfaContentChild(element)
          ) {
            return rdfaAttrs;
          }
          return false;
        },
        contentElement: getRdfaContentElement,
      },
      // Backwards compatibility
      {
        tag: 'div',
        preserveWhitespace: false,
        getAttrs(element: HTMLElement) {
          const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
          if (hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), type)) {
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
  context: string;
  allowSplitByTable?: boolean;
  tag?: string;
}): NodeSpec {
  const { content, context, tag = 'div' } = config;
  return {
    content,
    inline: false,
    defining: true,
    editable: true,
    isolating: true,
    allowSplitByTable: config.allowSplitByTable,
    attrs: rdfaAttrSpec({ rdfaAware }),
    toDOM(node) {
      return renderRdfaAware({
        renderable: node,
        tag,
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
        tag,
        context,
        getAttrs(element: HTMLElement) {
          const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
          if (
            hasBacklink(rdfaAttrs, SAY('body')) &&
            hasRdfaContentChild(element)
          ) {
            return rdfaAttrs;
          }
          return false;
        },
        contentElement: getRdfaContentElement,
      },
      // Backwards compatibility with old versions, without explicit content nodes
      {
        tag,
        context,
        getAttrs(element: HTMLElement) {
          const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
          if (hasBacklink(rdfaAttrs, SAY('body'))) {
            return rdfaAttrs;
          }
          return false;
        },
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

export type StructureHeaderType = 'structure_header' | 'article_header';

type StructureHeaderArgs = {
  type: StructureHeaderType;
  outlineText: (node: PNode) => string;
  includeLevel: boolean;
  numberDisplayStyle?: 'decimal' | 'roman';
};

export function constructStructureHeaderNodeSpec({
  type,
  outlineText,
  includeLevel,
  numberDisplayStyle = 'decimal',
}: StructureHeaderArgs): NodeSpec {
  return {
    content: 'text* structure_header_number text* structure_header_title',
    inline: false,
    defining: true,
    isolating: true,
    editable: true,
    selectable: false,
    allowSplitByTable: false,
    attrs: {
      ...rdfaAttrSpec({ rdfaAware }),
      property: {
        default: SAY('heading').prefixed,
      },
      number: {
        default: 1,
      },
      numberDisplayStyle: {
        default: numberDisplayStyle,
      },
      startNumber: {
        default: null,
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
          ...enhanceAttributesWithNumberAttributes(attrs),
          ...(includeLevel ? { level: level as number } : {}),
        },
        content: 0,
      });
    },
    parseDOM: [
      {
        tag: `h1,h2,h3,h4,h5,h6,span${type === 'article_header' ? ',div' : ''}`,
        context: type === 'article_header' ? 'article/' : undefined,
        // Need to have higher priority than default (50) as otherwise seems to get parsed as a
        // generic header
        priority: 60,
        getAttrs(element: HTMLElement) {
          const level = TAG_TO_LEVEL.get(element.tagName.toLowerCase()) ?? 6;
          const rdfaAttrs = getRdfaAttrs(element, { rdfaAware });
          if (hasBacklink(rdfaAttrs, SAY('heading'))) {
            const titleChild = element.querySelector(`
              span[property~='${EXT('title').prefixed}'],
              span[property~='${EXT('title').full}']`);

            const numberAttributes = getNodeNumberAttrsFromElement(element);

            if (titleChild) {
              return { level, ...rdfaAttrs, ...numberAttributes };
            }
          }

          return false;
        },
        contentElement: getRdfaContentElement,
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

export function containsOnlyPlaceholder(schema: Schema, node: PNode) {
  return (
    node.childCount === 1 &&
    node.firstChild?.type === schema.nodes['paragraph'] &&
    node.firstChild.firstChild?.type === schema.nodes['placeholder']
  );
}

export const enhanceAttributesWithNumberAttributes = (attrs: Attrs) => {
  const { startNumber, numberDisplayStyle, number, ...remainingAttrs } = attrs;

  return {
    ['data-number']: number ? `${number}` : null,
    ['data-start-number']: startNumber ? `${startNumber}` : null,
    ['data-number-display-style']: numberDisplayStyle as string,
    number: number as string,
    ...remainingAttrs,
  };
};

export const getNodeNumberAttrsFromElement = (element: Element) => {
  const number = element.getAttribute('data-number');
  const startNumber = element.getAttribute('data-start-number');
  const numberDisplayStyle = element.getAttribute('data-number-display-style');

  return {
    numberDisplayStyle: numberDisplayStyle ?? 'decimal',
    startNumber: startNumber ? parseInt(startNumber, 10) : null,
    number: number ? parseInt(number, 10) : 1,
  };
};

export const maybeNumber = (number: string | number | null | undefined) => {
  if (typeof number === 'string' && number.length > 0) {
    return parseInt(number, 10);
  }

  if (typeof number === 'number') {
    return number;
  }

  return null;
};

type NumberUtilsProps = {
  // Offset for the position of the node where the starting number is stored.
  // For structures with `structure_header` it will usually be +1,
  // for `articleParagraph` it is 0.
  offset?: number;
  convertNumber?: (number: number) => string;
};

export const getNumberUtils = ({
  offset = 0,
  convertNumber = romanize,
}: NumberUtilsProps): Pick<
  StructureSpec,
  | 'setStartNumber'
  | 'getStartNumber'
  | 'getNumber'
  | 'setNumber'
  | 'numberConfig'
> => ({
  numberConfig: {
    convertNumber,
  },
  setNumber: ({ number, pos, transaction }) =>
    transaction.setNodeAttribute(pos + offset, 'number', number),
  getNumber: ({ pos, transaction }) => {
    const node = unwrap(transaction.doc.nodeAt(pos + offset));

    const number = maybeNumber(node.attrs.number);

    if (number !== null) {
      return number;
    }

    return null;
  },
  getStartNumber: ({ pos, transaction }) => {
    const node = unwrap(transaction.doc.nodeAt(pos + offset));

    const startNumber = maybeNumber(node.attrs.startNumber);

    if (startNumber !== null) {
      return startNumber;
    }

    return null;
  },
  setStartNumber: ({ number, pos, transaction }) =>
    transaction.setNodeAttribute(pos + offset, 'startNumber', number),
});
