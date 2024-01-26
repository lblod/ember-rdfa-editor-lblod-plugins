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
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import VariableNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import { hasParsedRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;
const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node);
      if (!attrs) {
        return false;
      }
      if (
        hasParsedRDFaAttribute(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector('[data-content-container="true"]') &&
        hasRdfaVariableType(attrs, 'text')
      ) {
        if (!attrs.subject) {
          return false;
        }
        console.log('parse text-var');
        return attrs;
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
        parseVariableType(node) === 'text'
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);
        const label = parseLabel(node);
        return {
          __rdfaId: uuidv4(),
          subject: mappingResource,
          resource: mappingResource,
          rdfaNodeType: 'resource',
          properties: [
            {
              type: 'attribute',
              predicate: RDF('type').full,
              object: EXT('Mapping').full,
            },
            {
              type: 'attribute',
              predicate: EXT('instance').full,
              object:
                variableInstance ??
                `http://data.lblod.info/variables/${uuidv4()}`,
            },
            {
              type: 'attribute',
              predicate: EXT('label').full,
              object: label,
            },
            { type: 'attribute', predicate: DCT('type').full, object: 'text' },
            {
              type: 'content',
              predicate: EXT('content').full,
            },
          ],
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
    tag: 'span',
    attrs: node.attrs,
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
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  editable: true,
  attrs: {
    ...rdfaAttrSpec,
  },
  toDOM,
  parseDOM,
};

export const text_variable = createEmberNodeSpec(emberNodeConfig);
export const textVariableView = createEmberNodeView(emberNodeConfig);
