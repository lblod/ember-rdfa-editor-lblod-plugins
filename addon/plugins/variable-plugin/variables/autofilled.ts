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
import { hasRdfaVariableType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import NodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import { generateVariableInstanceUri } from '../utils/variable-helpers';
import { createAutofilledVariableAttrs } from '../actions/create-autofilled-variable';

const CONTENT_SELECTOR = '[data-content-container="true"]';

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
        hasOutgoingNamedNodeTriple(
          attrs,
          RDF('type'),
          VARIABLES('VariableInstance'),
        ) &&
        node.querySelector(CONTENT_SELECTOR) &&
        hasRdfaVariableType(attrs, 'autofilled')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const autofillKey = node.dataset.autofillKey;
        const convertToString = node.dataset.convertToString === 'true';
        const initialized = node.dataset.initialized === 'true';
        return { ...attrs, autofillKey, convertToString, initialized };
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
        hasRdfaVariableType(attrs, 'autofilled')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const variableUri = attrs.subject;
        const variableInstanceUri =
          getOutgoingTriple(attrs, EXT('instance'))?.object.value ??
          generateVariableInstanceUri();
        const label = getOutgoingTriple(attrs, EXT('label'))?.object.value;
        const autofillKey = node.dataset.autofillKey;
        const convertToString = node.dataset.convertToString === 'true';
        const initialized = node.dataset.initialized === 'true';

        return createAutofilledVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
          autofillKey,
          convertToString,
          initialized,
        });
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {
      'data-autofill-key': node.attrs.autofillKey,
      'data-convert-to-string': node.attrs.convertToString,
      'data-initialized': node.attrs.initialized,
    },
    content: 0,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'autofilled-variable',
  component: NodeViewComponent as unknown as ComponentLike,
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
    autofillKey: {
      default: '',
    },
    convertToString: {
      default: false,
    },
    initialized: {
      default: false,
    },
  },
  toDOM,
  parseDOM: [...parseDOM, ...parseDOMLegacy],
};

export const autofilled_variable = createEmberNodeSpec(emberNodeConfig);
export const autofilledVariableView = createEmberNodeView(emberNodeConfig);
