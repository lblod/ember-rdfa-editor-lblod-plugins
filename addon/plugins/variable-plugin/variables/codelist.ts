import {
  hasParsedRDFaAttribute,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
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
  PNode,
  getRdfaAttrs,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseSelectionStyle,
  parseVariableInstance,
  parseVariableSource,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import VariableNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;

const parseDOM = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node);
      console.log('attrs', attrs);
      if (!attrs) {
        return false;
      }
      if (
        hasParsedRDFaAttribute(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector('[data-content-container="true"]') &&
        hasRdfaVariableType(attrs, 'codelist')
      ) {
        if (!attrs.subject) {
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
            predicate: DCT('type').full,
            object: 'codelist',
          },
          {
            type: 'content',
            predicate: EXT('content').full,
          },
        ];
        if (label) {
          properties.push({
            type: 'attribute',
            predicate: EXT('label').full,
            object: label,
          });
        }
        if (codelistResource) {
          properties.push({
            type: 'attribute',
            predicate: EXT('codelist').full,
            object: codelistResource,
          });
        }
        if (source) {
          properties.push({
            type: 'attribute',
            predicate: DCT('source').full,
            object: source,
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
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  attrs: {
    ...rdfaAttrSpec,
    selectionStyle: {
      default: null,
    },
  },
  toDOM,
  parseDOM,
};

export const codelist = createEmberNodeSpec(emberNodeConfig);
export const codelistView = createEmberNodeView(emberNodeConfig);
