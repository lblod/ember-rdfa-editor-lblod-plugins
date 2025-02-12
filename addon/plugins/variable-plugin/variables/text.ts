import {
  EXT,
  RDF,
  VARIABLES,
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
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import VariableNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { generateVariableInstanceUri } from '../utils/variable-helpers';
import { createTextVariableAttrs } from '../actions/create-text-variable';

const rdfaAware = true;

const CONTENT_SELECTOR = '[data-content-container="true"]';
const CONTENT_SELECTOR_LEGACY = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;
const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      if (
        hasOutgoingNamedNodeTriple(
          attrs,
          RDF('type'),
          VARIABLES('VariableInstance'),
        ) &&
        node.querySelector(CONTENT_SELECTOR) &&
        hasRdfaVariableType(attrs, 'text')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        return attrs;
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
      if (!attrs) {
        return false;
      }
      if (
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector(CONTENT_SELECTOR) &&
        hasRdfaVariableType(attrs, 'text')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const variableUri = attrs.subject;
        if (!variableUri) {
          return false;
        }
        const variableInstanceUri =
          getOutgoingTriple(attrs, EXT('instance'))?.object.value ??
          generateVariableInstanceUri();
        const label = getOutgoingTriple(attrs, EXT('label'))?.object.value;

        return createTextVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
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
        node.querySelector(CONTENT_SELECTOR_LEGACY) &&
        parseVariableType(node) === 'text'
      ) {
        const variableUri =
          node.getAttribute('subject') ||
          node.getAttribute('resource') ||
          node.getAttribute('about');
        if (!variableUri) {
          return false;
        }
        const variableInstanceUri =
          parseVariableInstance(node) ?? generateVariableInstanceUri();
        const label = parseLabel(node) ?? undefined;

        return createTextVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
        });
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR_LEGACY,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {},
    content: 0,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'text-variable',
  component: VariableNodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  editable: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
  },
  toDOM,
  parseDOM: [...parseDOM, ...parseDOMLegacy],
};

export const text_variable = createEmberNodeSpec(emberNodeConfig);
export const textVariableView = createEmberNodeView(emberNodeConfig);
