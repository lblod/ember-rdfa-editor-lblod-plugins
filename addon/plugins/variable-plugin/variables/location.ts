import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';
import { DOMOutputSpec, getRdfaAttrs, PNode, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableSource,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import {
  contentSpan,
  instanceSpan,
  mappingSpan,
  sourceSpan,
  typeSpan,
} from '../utils/dom-constructors';
import LocationNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/nodeview';
import type { ComponentLike } from '@glint/template';
import {
  getParsedRDFAAttribute,
  hasParsedRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;

const parseDOM = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node);
      console.log('attrs', attrs);
      if (
        hasParsedRDFaAttribute(attrs, RDF('type'), EXT('Mapping')) &&
        hasRdfaVariableType(attrs, 'location')
      ) {
        const mappingResource = attrs.subject;
        if (!mappingResource) {
          return false;
        }
        const variableInstance = getParsedRDFAAttribute(attrs, EXT('instance'))
          ?.object;
        const label = getParsedRDFAAttribute(attrs, EXT('label'))?.object;
        const source = getParsedRDFAAttribute(attrs, DCT('source'))?.object;

        return {
          ...attrs,
          variableInstance:
            variableInstance ?? `http://data.lblod.info/variables/${uuidv4()}`,
          mappingResource,
          source,
          label,
        };
      }
      return false;
    },
    contentElement: '[data-content-container="true"]',
  },
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
          ...getRdfaAttrs(node),
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
];

const toDOM = (node: PNode): DOMOutputSpec => {
  return renderRdfaAware({
    renderable: node,
    attrs: {},
    tag: 'span',
    content: 0,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'location',
  component: LocationNodeViewComponent as unknown as ComponentLike,
  inline: true,
  editable: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  attrs: {
    ...rdfaAttrSpec,
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
