import {
  DCT,
  EXT,
  RDF,
  VARIABLES,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DOMOutputSpec,
  getRdfaAttrs,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableSource,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import NodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { createClassicLocationVariableAttrs } from '../actions/create-classic-location-variable';
import { generateVariableInstanceUri } from '../utils/variable-helpers';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

const CONTENT_SELECTOR = '[data-content-container="true"]';

const LEGACY_CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;

const rdfaAware = true;

const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      if (
        node.dataset.sayVariable &&
        node.dataset.sayVariableType === 'location' &&
        node.querySelector(CONTENT_SELECTOR)
      ) {
        const label = node.dataset.label;
        const source = node.dataset.source;
        return { ...attrs, label, source };
      }
      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const parseDOMLegacy = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs || attrs.rdfaNodeType !== 'resource') {
        return false;
      }

      if (
        hasOutgoingNamedNodeTriple(
          attrs,
          RDF('type'),
          VARIABLES('VariableInstance'),
        ) &&
        node.querySelector(CONTENT_SELECTOR) &&
        hasRdfaVariableType(attrs, 'location')
      ) {
        const variableInstanceUri = attrs.subject;
        const variableUri = getOutgoingTriple(attrs, VARIABLES('instanceOf'))
          ?.object.value;
        if (!variableInstanceUri || !variableUri) {
          return false;
        }

        const sourceUri = getOutgoingTriple(attrs, DCT('source'))?.object.value;
        const label = getOutgoingTriple(attrs, DCT('title'))?.object.value;

        return createClassicLocationVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
          source: sourceUri,
        });
      }
      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        isVariable(node) &&
        node.querySelector(LEGACY_CONTENT_SELECTOR) &&
        parseVariableType(node) === 'location'
      ) {
        const variableUri = node.getAttribute('resource');
        if (!variableUri) {
          return false;
        }
        const variableInstanceUri =
          parseVariableInstance(node) ?? generateVariableInstanceUri();
        const source = parseVariableSource(node) ?? undefined;
        const label = parseLabel(node) ?? undefined;
        return createClassicLocationVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
          source,
        });
      }

      return false;
    },
    contentElement: LEGACY_CONTENT_SELECTOR,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const { label, source } = node.attrs;
  return renderRdfaAware({
    renderable: node,
    attrs: {
      'data-say-variable': 'true',
      'data-say-variable-type': 'location',
      'data-label': label,
      'data-source': source,
    },
    tag: 'span',
    content: 0,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'location',
  component: NodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  editable: true,
  selectable: true,
  recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    label: {
      default: null,
    },
    source: {},
    datatype: {
      default: XSD('string').namedNode,
    },
  },
  toDOM,
  parseDOM: [...parseDOM, ...parseDOMLegacy],
};

export const location = createEmberNodeSpec(emberNodeConfig);
export const locationView = createEmberNodeView(emberNodeConfig);
