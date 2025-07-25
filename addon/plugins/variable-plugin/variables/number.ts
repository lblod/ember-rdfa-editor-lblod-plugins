import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DOMOutputSpec,
  EditorState,
  getRdfaAttrs,
  TagParseRule,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
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
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { isNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { numberToWords } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/number-to-words';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import NumberNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/nodeview';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import { generateVariableInstanceUri } from '../utils/variable-helpers';
import { createNumberVariableAttrs } from '../actions/create-number-variable';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

const rdfaAware = true;
const parseDOM: TagParseRule[] = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      if (
        node.dataset.sayVariable &&
        node.dataset.sayVariableType === 'number'
      ) {
        const label = node.dataset.label;
        const writtenNumber =
          node.getAttribute('data-written-number') === 'true' ? true : false;
        const minimumValue = node.getAttribute('data-minimum-value');
        const maximumValue = node.getAttribute('data-maximum-value');
        return {
          ...attrs,
          label,
          writtenNumber,
          minimumValue,
          maximumValue,
        };
      }
      return false;
    },
  },
];

const parseDOMLegacy: TagParseRule[] = [
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
        hasRdfaVariableType(attrs, 'number')
      ) {
        const variableInstanceUri = attrs.subject;
        const variableUri = getOutgoingTriple(attrs, VARIABLES('instanceOf'))
          ?.object.value;
        if (!variableInstanceUri || !variableUri) {
          return false;
        }
        const value = getOutgoingTriple(attrs, RDF('value'))?.object.value;
        const writtenNumber =
          node.getAttribute('data-written-number') === 'true' ? true : false;
        const minimumValue = node.dataset.minimumValue
          ? parseInt(node.dataset.minimumValue)
          : undefined;
        const maximumValue = node.dataset.maximumValue
          ? parseInt(node.dataset.maximumValue)
          : undefined;
        const label = getOutgoingTriple(attrs, DCT('title'))?.object.value;
        return createNumberVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          value,
          label,
          writtenNumber,
          minimumValue,
          maximumValue,
        });
      }
      return false;
    },
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
        hasRdfaVariableType(attrs, 'number')
      ) {
        const variableUri = attrs.subject;
        if (!variableUri) {
          return false;
        }
        const variableInstanceUri =
          getOutgoingTriple(attrs, EXT('instance'))?.object.value ??
          generateVariableInstanceUri();

        const value = getOutgoingTriple(attrs, EXT('value'))?.object.value;
        const writtenNumber =
          node.getAttribute('data-written-number') === 'true' ? true : false;
        const minimumValue = node.dataset.minimumValue
          ? parseInt(node.dataset.minimumValue)
          : undefined;
        const maximumValue = node.dataset.maximumValue
          ? parseInt(node.dataset.maximumValue)
          : undefined;

        const label = getOutgoingTriple(attrs, EXT('label'))?.object.value;

        return createNumberVariableAttrs({
          variableInstance: variableInstanceUri,
          variable: variableUri,
          label,
          value,
          maximumValue,
          minimumValue,
          writtenNumber,
        });
      }
      return false;
    },
  },
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (isVariable(node) && parseVariableType(node) === 'number') {
        const variableUri =
          node.getAttribute('subject') ||
          node.getAttribute('resource') ||
          node.getAttribute('about');
        if (!variableUri) {
          return false;
        }
        const variableInstanceUri =
          parseVariableInstance(node) ?? generateVariableInstanceUri();
        const label = parseLabel(node) ?? undefined;
        const value =
          [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
            ?.getAttribute('content') ?? undefined;
        const writtenNumber =
          node.getAttribute('data-written-number') === 'true' ? true : false;
        const minimumValue = node.dataset.minimumValue
          ? parseInt(node.dataset.minimumValue)
          : undefined;
        const maximumValue = node.dataset.maximumValue
          ? parseInt(node.dataset.maximumValue)
          : undefined;

        return createNumberVariableAttrs({
          variableInstance: variableInstanceUri,
          variable: variableUri,
          label,
          value,
          maximumValue,
          minimumValue,
          writtenNumber,
        });
      } else {
        return false;
      }
    },
  },
];

const serialize = (node: PNode, state: EditorState): DOMOutputSpec => {
  const t = getTranslationFunction(state);
  const docLang = state.doc.attrs.lang as string;
  const { writtenNumber, content, minimumValue, maximumValue } = node.attrs;

  let humanReadableContent: string;

  if (isNumber(content)) {
    if (writtenNumber) {
      humanReadableContent = numberToWords(Number(content), { lang: docLang });
    } else {
      humanReadableContent = content as string;
    }
  } else {
    humanReadableContent = t('variable.number.placeholder', 'Voeg getal in');
  }

  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {
      class: `${getClassnamesFromNode(node)}${content ? '' : ' say-variable'}`,
      'data-say-variable': 'true',
      'data-say-variable-type': 'number',
      'data-written-number': String(writtenNumber ?? false),
      'data-minimum-value': (minimumValue as string) ?? null,
      'data-maximum-value': (maximumValue as string) ?? null,
      'data-label': node.attrs['label'],
    },
    content: humanReadableContent.toString(),
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'number',
  component: NumberNodeviewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUriFunction: recreateVariableUris,
  editable: true,
  draggable: false,
  needsFFKludge: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    label: {
      default: null,
    },
    writtenNumber: { default: false },
    minimumValue: { default: null },
    maximumValue: { default: null },
    datatype: {
      default: XSD('decimal').namedNode,
    },
  },
  leafText: (node: PNode) => {
    const { value } = node.attrs;
    return value as string;
  },
  classNames: ['say-number-variable'],
  parseDOM: [...parseDOM, ...parseDOMLegacy],
  serialize,
};

export const number = createEmberNodeSpec(emberNodeConfig);
export const numberView = createEmberNodeView(emberNodeConfig);
