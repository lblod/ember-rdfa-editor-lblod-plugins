import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import {
  filterOutContentProperties,
  isVariable,
  isVariableNew,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
  parseVariableTypeNew,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import { contentSpan } from '../utils/dom-constructors';
import VariableNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import {
  getRdfaAttrs,
  renderInvisibleRdfa,
} from '@lblod/ember-rdfa-editor/core/schema';
import { Property } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;

const parseDOM = [
  //Parsing rule that cares less about html structure (only about the RDFa).
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const rdfaAttrs = getRdfaAttrs(node);
      if (!rdfaAttrs || rdfaAttrs.rdfaNodeType === 'literal') {
        return false;
      }
      // Parse properties and filter out 'special' properites (still TODO)
      if (
        isVariableNew(node) &&
        node.querySelector(CONTENT_SELECTOR) &&
        parseVariableTypeNew(node) === 'text'
      ) {
        const resource = rdfaAttrs.resource;
        const label = parseLabel(node);
        const { properties, backlinks } = rdfaAttrs;
        const filteredProperties = filterOutContentProperties(properties);
        return {
          resource,
          label,
          backlinks,
          properties: filteredProperties,
        };
      }
      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
  //Parsing rule for the old structure (should actually not be needed)
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        isVariable(node) &&
        node.querySelector(CONTENT_SELECTOR) &&
        parseVariableType(node) === 'text'
      ) {
        const resource = parseVariableInstance(node);
        const label = parseLabel(node);
        return {
          resource: resource ?? `http://data.lblod.info/variables/${uuidv4()}`,
          label,
        };
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const { label, resource, properties } = node.attrs;
  const extendedProperties = [
    ...(properties as Property[]),
    {
      type: 'attribute',
      predicate: 'rdf:type',
      object: EXT('Variable').prefixed,
    },
    {
      type: 'attribute',
      predicate: 'dct:type',
      object: 'text',
    },
  ];
  const nodeCopy = node.type.create(
    { ...node.attrs, properties: extendedProperties },
    node.content,
    node.marks,
  );
  return [
    'span',
    { 'data-label': label as string, resource: resource as string },
    renderInvisibleRdfa(nodeCopy, 'span'),
    contentSpan({}, 0),
  ];
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'text-variable',
  component: VariableNodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  attrs: {
    properties: {
      default: [],
    },
    backlinks: {
      default: [],
    },
    resource: {},
    rdfaNodeType: {
      default: 'resource',
    },
    label: { default: null },
  },
  toDOM,
  parseDOM,
};

export const text_variable = createEmberNodeSpec(emberNodeConfig);
export const textVariableView = createEmberNodeView(emberNodeConfig);
