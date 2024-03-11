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
        hasRdfaVariableType(attrs, 'text')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
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
        const mappingSubject =
          node.getAttribute('subject') ||
          node.getAttribute('resource') ||
          node.getAttribute('about');
        if (!mappingSubject) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);
        const label = parseLabel(node);
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
              object: sayDataFactory.literal('text'),
            },
            {
              predicate: EXT('content').full,
              object: sayDataFactory.contentLiteral(),
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
    ...rdfaAttrSpec({ rdfaAware }),
  },
  toDOM,
  parseDOM,
};

export const text_variable = createEmberNodeSpec(emberNodeConfig);
export const textVariableView = createEmberNodeView(emberNodeConfig);
