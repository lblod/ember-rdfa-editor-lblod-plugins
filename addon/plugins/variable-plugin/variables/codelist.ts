import {
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
  MOBILITEIT,
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
  PNode,
  getRdfaAttrs,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  hasRdfaVariableType,
  isVariable,
  isVariableNewModel,
  parseLabel,
  parseSelectionStyle,
  parseVariableInstance,
  parseVariableSource,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import VariableNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;
const CONTENT_SELECTOR_NEW_MODEL = `span[property~='${RDF('value').prefixed}'],
                          span[property~='${RDF('value').full}']`;
const rdfaAware = true;

const parseDOM = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      if (
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector('[data-content-container="true"]') &&
        hasRdfaVariableType(attrs, 'codelist')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const selectionStyle = node.dataset.selectionStyle ?? null;

        return {
          ...attrs,
          selectionStyle,
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
        parseVariableType(node) === 'codelist'
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);

        const source = parseVariableSource(node);
        const label = parseLabel(node);
        const selectionStyle = parseSelectionStyle(node);
        const codelistSpan = [...node.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('codelist')),
        );
        const codelistResource =
          codelistSpan?.getAttribute('resource') ??
          codelistSpan?.getAttribute('content');

        const properties = [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
            ),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('codelist'),
          },
          {
            predicate: EXT('content').full,
            object: sayDataFactory.contentLiteral(),
          },
        ];
        if (label) {
          properties.push({
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label),
          });
        }
        if (codelistResource) {
          properties.push({
            predicate: EXT('codelist').full,
            object: sayDataFactory.namedNode(codelistResource),
          });
        }
        if (source) {
          properties.push({
            predicate: DCT('source').full,
            object: sayDataFactory.namedNode(source),
          });
        }
        return {
          selectionStyle,
          subject: mappingResource,
          rdfaNodeType: 'resource',
          __rdfaId: uuidv4(),
          properties,
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
        parseVariableType(node) === 'codelist'
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);

        const source = parseVariableSource(node);
        const label = parseLabel(node);
        const selectionStyle = parseSelectionStyle(node);
        const codelistSpan = [...node.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('codelist')),
        );
        const codelistResource =
          codelistSpan?.getAttribute('resource') ??
          codelistSpan?.getAttribute('content');

        const properties = [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(MOBILITEIT('Variabele').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
            ),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('codelist'),
          },
          {
            predicate: RDF('value').full,
            object: sayDataFactory.contentLiteral(),
          },
        ];
        if (label) {
          properties.push({
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label),
          });
        }
        if (codelistResource) {
          properties.push({
            predicate: EXT('codelist').full,
            object: sayDataFactory.namedNode(codelistResource),
          });
        }
        if (source) {
          properties.push({
            predicate: DCT('source').full,
            object: sayDataFactory.namedNode(source),
          });
        }
        return {
          selectionStyle,
          subject: mappingResource,
          rdfaNodeType: 'resource',
          __rdfaId: uuidv4(),
          properties,
        };
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR_NEW_MODEL,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const { selectionStyle } = node.attrs;

  return renderRdfaAware({
    renderable: node,
    attrs: {
      'data-selection-style': selectionStyle as string,
    },
    tag: 'span',
    content: 0,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'codelist',
  component: VariableNodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  editable: true,
  recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    selectionStyle: {
      default: null,
    },
  },
  toDOM,
  parseDOM,
};

export const codelist = createEmberNodeSpec(emberNodeConfig);
export const codelistView = createEmberNodeView(emberNodeConfig);
