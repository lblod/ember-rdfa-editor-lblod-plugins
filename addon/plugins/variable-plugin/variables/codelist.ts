import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
  MOBILITEIT,
  RDF,
  VARIABLES,
  XSD,
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
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

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
        node.dataset.sayVariable &&
        node.dataset.sayVariableType === 'codelist' &&
        node.querySelector(CONTENT_SELECTOR)
      ) {
        const label = node.dataset.label;
        const source = node.dataset.source;
        const codelist = node.dataset.codelist;
        const selectionStyle = node.dataset.selectionStyle;
        return { ...attrs, label, source, codelist, selectionStyle };
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
      if (!attrs || attrs.rdfaNodeType !== 'resource') {
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
        const variableInstanceUri = attrs.subject;
        const variableUri = getOutgoingTriple(attrs, VARIABLES('instanceOf'))
          ?.object.value;
        if (!variableInstanceUri || !variableUri) {
          return false;
        }

        const codelistUri = getOutgoingTriple(attrs, MOBILITEIT('codelijst'))
          ?.object.value;
        const sourceUri = getOutgoingTriple(attrs, DCT('source'))?.object.value;
        const selectionStyle = node.dataset.selectionStyle;
        const label = getOutgoingTriple(attrs, DCT('title'))?.object.value;

        return createCodelistVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
          // These attrs are required but it's possible for older documents to get into a broken
          // state. We mark these as unknown so we can push the user to fix this as we can't do it.
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
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs || attrs.rdfaNodeType !== 'resource') {
        return false;
      }

      if (
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector(CONTENT_SELECTOR) &&
        hasRdfaVariableType(attrs, 'codelist')
      ) {
        const variableUri = attrs.subject;
        const variableInstanceUri =
          getOutgoingTriple(attrs, EXT('instance'))?.object.value ??
          generateVariableInstanceUri();

        const codelistUri = getOutgoingTriple(attrs, EXT('codelist'))?.object
          .value;
        const sourceUri = getOutgoingTriple(attrs, DCT('source'))?.object.value;
        const selectionStyle = node.dataset.selectionStyle;
        const label = getOutgoingTriple(attrs, EXT('label'))?.object.value;
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
        const selectionStyle = node.dataset.selectionStyle;
        const codelistSpan = Array.from(node.children).find((el) =>
          hasRDFaAttribute(el, 'property', EXT('codelist')),
        );
        const codelistUri =
          codelistSpan?.getAttribute('resource') ??
          codelistSpan?.getAttribute('content') ??
          undefined;
        const label = parseLabel(node) ?? undefined;

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
  const { selectionStyle, label, codelist, source } = node.attrs;
  const onlyContentType =
    node.content.size === 1 && node.content.firstChild?.type;
  const className =
    onlyContentType &&
    onlyContentType === onlyContentType.schema.nodes['placeholder']
      ? ' say-variable'
      : '';

  return renderRdfaAware({
    renderable: node,
    attrs: {
      class: `${getClassnamesFromNode(node)}${className}`,
      'data-say-variable': 'true',
      'data-say-variable-type': 'codelist',
      'data-selection-style': selectionStyle as string,
      'data-label': label as string | null,
      'data-codelist': codelist as string,
      'data-source': source as string,
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
    label: {
      default: null,
    },
    codelist: {
      default: 'UNKNOWN',
    },
    source: {
      default: 'UNKNOWN',
    },
    selectionStyle: {
      default: null,
    },
    datatype: {
      default: XSD('string').namedNode,
    },
  },
  classNames: ['say-codelist-variable'],
  toDOM,
  parseDOM: [...parseDOM, ...parseDOMLegacy],
};

export const codelist = createEmberNodeSpec(emberNodeConfig);
export const codelistView = createEmberNodeView(emberNodeConfig);
