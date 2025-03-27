import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
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
import { formatDate, validateDateFormat } from '../utils/date-helpers';
import DateNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/nodeview';
import {
  RdfaAttrs,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import {
  generateVariableInstanceUri,
  generateVariableUri,
} from '../utils/variable-helpers';
import { createDateVariableAttrs } from '../actions/create-date-variable';

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
      if (
        hasOutgoingNamedNodeTriple(
          attrs,
          RDF('type'),
          VARIABLES('VariableInstance'),
        ) &&
        hasRdfaVariableType(attrs, 'date')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        const format = node.dataset.format;
        const custom = node.dataset.custom === 'true';
        const customAllowed = node.dataset.customAllowed !== 'false';

        return {
          ...attrs,
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
          onlyDate: true,
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
        const onlyDate = hasRDFaAttribute(node, 'datatype', XSD('date'));
        const content = node.getAttribute('content') ?? undefined;
        return createDateVariableAttrs({
          variable: generateVariableUri(),
          variableInstance: generateVariableInstanceUri(),
          format: node.dataset.format,
          custom: node.dataset.custom === 'true',
          customAllowed: node.dataset.customAllowed !== 'false',
          onlyDate,
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
        const onlyDate = !![...node.children].find((el) =>
          hasRDFaAttribute(el, 'datatype', XSD('date')),
        );
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
          onlyDate,
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
  const value = getOutgoingTriple(node.attrs, RDF('value'))?.object.value;
  // TODO Could remove the custom 'onlyDate' attr and instead use the datatype of the outgoing
  // content triple.
  const { onlyDate, format, custom, customAllowed } = node.attrs;
  let humanReadableDate: string;
  if (value) {
    if (validateDateFormat(format).type === 'ok') {
      humanReadableDate = formatDate(new Date(value), format);
    } else {
      humanReadableDate = t(
        'date-plugin.validation.unknown',
        TRANSLATION_FALLBACKS.unknownFormat,
      );
    }
  } else {
    humanReadableDate = (onlyDate as boolean)
      ? t('date-plugin.insert.date', TRANSLATION_FALLBACKS.insertDate)
      : t('date-plugin.insert.datetime', TRANSLATION_FALLBACKS.insertDateTime);
  }
  const dateAttrs = {
    class: 'say-variable',
    'data-format': format as string,
    'data-custom': custom ? 'true' : 'false',
    'data-custom-allowed': customAllowed ? 'true' : 'false',
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
    ...rdfaAttrSpec({ rdfaAware }),
  },
  outlineText: (node: PNode, state: EditorState) => {
    const t = getTranslationFunction(state);
    const value = getOutgoingTriple(node.attrs as RdfaAttrs, RDF('value'))
      ?.object.value;
    const { onlyDate, format } = node.attrs;

    const humanReadableDate = value
      ? formatDate(new Date(value), format)
      : onlyDate
        ? t('date-plugin.insert.date', TRANSLATION_FALLBACKS.insertDate)
        : t(
            'date-plugin.insert.datetime',
            TRANSLATION_FALLBACKS.insertDateTime,
          );

    return humanReadableDate;
  },
  serialize,
  parseDOM: [...parseDOM, ...parseDOMLegacy],
});

export const date = (options: DateOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));
export const dateView = (options: DateOptions) =>
  createEmberNodeView(emberNodeConfig(options));
