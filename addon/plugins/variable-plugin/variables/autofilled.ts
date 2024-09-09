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
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import AutofilledNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/autofilled/nodeview';
import type { ComponentLike } from '@glint/template';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
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
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector('[data-content-container="true"]') &&
        hasRdfaVariableType(attrs, 'autofilled')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const autofillKey = node.dataset.autofillKey;
        const convertToString = node.dataset.convertToString
        return {
          ...attrs,
          autofillKey,
          convertToString
        }
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
        parseVariableType(node) === 'autofilled'
      ) {
        const mappingSubject =
          node.getAttribute('subject') ||
          node.getAttribute('resource') ||
          node.getAttribute('about');
        if (!mappingSubject) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);
        const label = parseLabel(node);
        const autofillKey = node.dataset.autofillKey;
        const convertToString = node.dataset.convertToString
        return {
          __rdfaId: uuidv4(),
          subject: mappingSubject,
          rdfaNodeType: 'resource',
          properties: [
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
              predicate: EXT('label').full,
              object: sayDataFactory.literal(label || ''),
            },
            {
              predicate: DCT('type').full,
              object: sayDataFactory.literal('autofilled'),
            },
            {
              predicate: EXT('content').full,
              object: sayDataFactory.contentLiteral(),
            },
          ],
          autofillKey,
          convertToString
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
    attrs: {
      ...node.attrs,
      'data-autofill-key': node.attrs.autofillKey,
      'data-convert-to-string': node.attrs.convertToString
    },
    content: 0,
  });
};

type AutofilledArgs = {
  autofilledValues: {
    [Key: string]: string
  }
}

const emberNodeConfig: EmberNodeConfig = {
  name: 'autofilled-variable',
  component: AutofilledNodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  editable: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    autofillKey: {
      default: ''
    },
    convertToString: {
      default: false
    }
  },
  toDOM,
  parseDOM,
};

export const autofilled_variable = createEmberNodeSpec(emberNodeConfig);
export const autofilledVariableView = createEmberNodeView(emberNodeConfig);
