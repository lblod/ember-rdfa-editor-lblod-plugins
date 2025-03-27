import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
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
  PNode,
  getRdfaAttrs,
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
import VariableNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import { generateVariableInstanceUri } from '../utils/variable-helpers';
import { createCodelistVariableAttrs } from '../actions/create-codelist-variable';

const CONTENT_SELECTOR = '[data-content-container="true"]';

const CONTENT_SELECTOR_LEGACY = `span[property~='${EXT('content').prefixed}'],
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
        hasOutgoingNamedNodeTriple(
          attrs,
          RDF('type'),
          VARIABLES('VariableInstance'),
        ) &&
        node.querySelector(CONTENT_SELECTOR) &&
        hasRdfaVariableType(attrs, 'codelist')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const selectionStyle = node.dataset.selectionStyle;
        return { ...attrs, selectionStyle };
      }
      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const parseDOMLegacy = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      if (
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector(CONTENT_SELECTOR) &&
        hasRdfaVariableType(attrs, 'codelist')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const variableUri = attrs.subject;
        const variableInstanceUri =
          getOutgoingTriple(attrs, EXT('instance'))?.object.value ??
          generateVariableInstanceUri();
        const label = getOutgoingTriple(attrs, EXT('label'))?.object.value;
        const codelistUri = getOutgoingTriple(attrs, EXT('codelist'))?.object
          .value;
        const sourceUri = getOutgoingTriple(attrs, DCT('source'))?.object.value;
        const selectionStyle = node.dataset.selectionStyle;
        return createCodelistVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
          source: sourceUri,
          codelist: codelistUri,
          selectionStyle,
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
        parseVariableType(node) === 'codelist'
      ) {
        const variableUri = node.getAttribute('resource');
        if (!variableUri) {
          return false;
        }
        const variableInstanceUri =
          parseVariableInstance(node) ?? generateVariableInstanceUri();

        const source = parseVariableSource(node) ?? undefined;
        const label = parseLabel(node) ?? undefined;
        const selectionStyle = node.dataset.selectionStyle;
        const codelistSpan = Array.from(node.children).find((el) =>
          hasRDFaAttribute(el, 'property', EXT('codelist')),
        );
        const codelistUri =
          codelistSpan?.getAttribute('resource') ??
          codelistSpan?.getAttribute('content') ??
          undefined;

        return createCodelistVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
          source,
          codelist: codelistUri,
          selectionStyle,
        });
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR_LEGACY,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const { selectionStyle } = node.attrs;

  return renderRdfaAware({
    renderable: node,
    attrs: {
      class: 'say-variable',
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
  parseDOM: [...parseDOM, ...parseDOMLegacy],
};

export const codelist = createEmberNodeSpec(emberNodeConfig);
export const codelistView = createEmberNodeView(emberNodeConfig);
