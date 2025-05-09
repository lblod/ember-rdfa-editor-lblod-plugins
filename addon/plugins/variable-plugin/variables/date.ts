import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DCT,
  EXT,
  RDF,
  VARIABLES,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  EditorState,
  getRdfaAttrs,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import {
  formatContainsTime,
  formatDate,
  validateDateFormat,
} from '../utils/date-helpers';
import DateNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/nodeview';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import {
  generateVariableInstanceUri,
  generateVariableUri,
} from '../utils/variable-helpers';
import { createDateVariableAttrs } from '../actions/create-date-variable';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

const TRANSLATION_FALLBACKS = {
  insertDate: 'Datum invoegen',
  insertDateTime: 'Datum en tijd invoegen',
  unknownFormat: 'Ongeldig formaat',
};

export type DateFormat = {
  label?: string;
  key: string;
  dateFormat: string;
  dateTimeFormat: string;
};

export type DateOptions = {
  formats: DateFormat[];
  allowCustomFormat: boolean;
};
const rdfaAware = true;

const parseDOM = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      if (node.dataset.sayVariable && node.dataset.sayVariableType === 'date') {
        const label = node.dataset.label;
        const format = node.dataset.format;
        const custom = node.dataset.custom === 'true';
        const customAllowed = node.dataset.customAllowed !== 'false';

        return {
          ...attrs,
          label,
          format,
          custom,
          customAllowed,
        };
      }
      return false;
    },
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
        hasRdfaVariableType(attrs, 'date')
      ) {
        const variableInstanceUri = attrs.subject;
        const variableUri = getOutgoingTriple(attrs, VARIABLES('instanceOf'))
          ?.object.value;
        if (!variableInstanceUri || !variableUri) {
          return false;
        }
        const value = getOutgoingTriple(attrs, RDF('value'))?.object.value;

        const format = node.dataset.format;
        const custom = node.dataset.custom === 'true';
        const customAllowed = node.dataset.customAllowed !== 'false';
        const label = getOutgoingTriple(attrs, DCT('title'))?.object.value;

        return createDateVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          value,
          label,
          format,
          custom,
          customAllowed,
        });
      }
      return false;
    },
  },
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
        hasRdfaVariableType(attrs, 'date')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const variableUri = attrs.subject;
        const variableInstanceUri =
          getOutgoingTriple(attrs, EXT('instance'))?.object.value ??
          generateVariableInstanceUri();
        const label = getOutgoingTriple(attrs, EXT('label'))?.object.value;
        const value = getOutgoingTriple(attrs, EXT('content'))?.object.value;
        const format = node.dataset.format;
        const custom = node.dataset.custom === 'true';
        const customAllowed = node.dataset.customAllowed !== 'false';

        return createDateVariableAttrs({
          variable: variableUri,
          variableInstance: variableInstanceUri,
          label,
          value,
          format,
          custom,
          customAllowed,
        });
      }
      return false;
    },
  },
  {
    /**
     * Parses dates in the form of e.g.:
     * <span datatype=XSD('date) content=.../>
     *
     * This is an older format, which we still parse.
     */
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        hasRDFaAttribute(node, 'datatype', XSD('date')) ||
        hasRDFaAttribute(node, 'datatype', XSD('dateTime'))
      ) {
        const content = node.getAttribute('content') ?? undefined;
        return createDateVariableAttrs({
          variable: generateVariableUri(),
          variableInstance: generateVariableInstanceUri(),
          format: node.dataset.format,
          custom: node.dataset.custom === 'true',
          customAllowed: node.dataset.customAllowed !== 'false',
          value: content,
        });
      }
      return false;
    },
  },
  {
    /**
     * Parses dates in the 2nd (variable) format (pre-RDFa rework) e.g.
     * <span resource="http://data.lblod.info/mappings/81190ceb-9ed0-4708-a344-99ba0bf039c5" typeof="ext:Mapping" class="date" data-label="datum">
     *   <span property="dct:type" content="date"></span>
     *   <span property="ext:content" datatype="xsd:date" data-format="dd/MM/yy" data-custom="false" data-custom-allowed="true" content="2024-02-12T23:00:00.000Z">
     *     13/02/24
     *   </span>
     * </span>
     */
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (isVariable(node) && parseVariableType(node) === 'date') {
        const variableUri =
          node.getAttribute('subject') ??
          node.getAttribute('resource') ??
          node.getAttribute('about');
        if (!variableUri) {
          return false;
        }
        const dateNode = [...node.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('content')),
        ) as HTMLElement | undefined;
        const value = dateNode?.getAttribute('content') ?? undefined;
        const format = dateNode?.dataset.format;
        const label = parseLabel(node) ?? undefined;
        return createDateVariableAttrs({
          variable: variableUri,
          variableInstance: generateVariableInstanceUri(),
          format,
          custom: node.dataset.custom === 'true',
          customAllowed: node.dataset.customAllowed !== 'false',
          value,
          label,
        });
      }

      return false;
    },
  },
];

const serialize = (node: PNode, state: EditorState) => {
  const t = getTranslationFunction(state);
  const { format, custom, customAllowed, content } = node.attrs;
  let humanReadableDate: string;
  if (content) {
    if (validateDateFormat(format).type === 'ok') {
      humanReadableDate = formatDate(new Date(content), format);
    } else {
      humanReadableDate = t(
        'date-plugin.validation.unknown',
        TRANSLATION_FALLBACKS.unknownFormat,
      );
    }
  } else {
    humanReadableDate = !formatContainsTime(format)
      ? t('date-plugin.insert.date', TRANSLATION_FALLBACKS.insertDate)
      : t('date-plugin.insert.datetime', TRANSLATION_FALLBACKS.insertDateTime);
  }
  const dateAttrs = {
    class: `${getClassnamesFromNode(node)}${content ? '' : ' say-variable'}`,
    'data-say-variable': 'true',
    'data-say-variable-type': 'date',
    'data-format': format as string,
    'data-custom': custom ? 'true' : 'false',
    'data-custom-allowed': customAllowed ? 'true' : 'false',
    'data-label': node.attrs['label'],
  };
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: dateAttrs,
    content: humanReadableDate,
  });
};

const emberNodeConfig = (options: DateOptions): EmberNodeConfig => ({
  name: 'date',
  group: 'inline variable',
  component: DateNodeviewComponent as unknown as ComponentLike,
  editable: true,
  inline: true,
  selectable: true,
  draggable: false,
  atom: true,
  recreateUriFunction: recreateVariableUris,
  defining: false,
  options,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    label: {
      default: null,
    },
    format: {
      default: options.formats[0].dateFormat,
    },
    onlyDate: {
      default: true,
    },
    custom: {
      default: false,
    },
    customAllowed: {
      default: options.allowCustomFormat,
    },
    datatype: {
      default: !formatContainsTime(options.formats[0].dateFormat)
        ? XSD('date').namedNode
        : XSD('dateTime').namedNode,
    },
  },
  outlineText: (node: PNode, state: EditorState) => {
    const t = getTranslationFunction(state);
    const { format, content } = node.attrs;

    const placeholder = !formatContainsTime(format)
      ? t('date-plugin.insert.date', TRANSLATION_FALLBACKS.insertDate)
      : t('date-plugin.insert.datetime', TRANSLATION_FALLBACKS.insertDateTime);

    const humanReadableDate = content
      ? formatDate(new Date(content), format)
      : placeholder;

    return humanReadableDate;
  },
  classNames: ['say-date-variable'],
  serialize,
  parseDOM: [...parseDOM, ...parseDOMLegacy],
});

export const date = (options: DateOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));
export const dateView = (options: DateOptions) =>
  createEmberNodeView(emberNodeConfig(options));
