import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import {
  isVariable,
  isVariableNewModel,
  parseLabel,
  parseVariableInstance,
  parseVariableSource,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import {
  instanceSpan,
  mappingSpan,
  sourceSpan,
  typeSpan,
} from '../utils/dom-constructors';
import { contentSpan } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import NodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import { recreateVariableUris } from '../utils/recreate-variable-uris';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;
const CONTENT_SELECTOR_NEW_MODEL = `span[property~='${RDF('value').prefixed}'],
                          span[property~='${RDF('value').full}']`;

const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        isVariable(node) &&
        node.querySelector(CONTENT_SELECTOR) &&
        parseVariableType(node) === 'location'
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);
        const source = parseVariableSource(node);
        const label = parseLabel(node);
        return {
          variableInstance:
            variableInstance ?? `http://data.lblod.info/variables/${uuidv4()}`,
          mappingResource,
          source,
          label,
        };
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        isVariableNewModel(node) &&
        node.querySelector(CONTENT_SELECTOR_NEW_MODEL) &&
        parseVariableType(node) === 'location'
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);
        const source = parseVariableSource(node);
        const label = parseLabel(node);
        return {
          variableInstance:
            variableInstance ?? `http://data.lblod.info/variables/${uuidv4()}`,
          mappingResource,
          source,
          label: label,
        };
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR_NEW_MODEL,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const { mappingResource, variableInstance, source, label } = node.attrs;
  return mappingSpan(
    mappingResource,
    {
      'data-label': label as string,
    },
    instanceSpan(variableInstance),
    typeSpan('location'),
    source ? sourceSpan(source) : '',
    contentSpan({}, 0),
  );
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'location',
  component: NodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  selectable: true,
  recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  attrs: {
    mappingResource: {},
    variableInstance: {},
    source: {
      default: null,
    },
    label: { default: null },
  },
  toDOM,
  parseDOM,
};

export const location = createEmberNodeSpec(emberNodeConfig);
export const locationView = createEmberNodeView(emberNodeConfig);
