import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EditorState, PNode } from '@lblod/ember-rdfa-editor';
import {
  isVariable,
  parseLabel,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import {
  contentSpan,
  mappingSpan,
  typeSpan,
} from '../../variable-plugin/utils/dom-constructors';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { formatDate, validateDateFormat } from '../utils/date-helpers';
import DateNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/nodeview';
import { v4 as uuidv4 } from 'uuid';

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

const parseDOM = [
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
        const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
        return {
          mappingResource,
          value: node.getAttribute('content'),
          onlyDate,
          format: node.dataset.format,
          custom: node.dataset.custom === 'true',
          customAllowed: node.dataset.customAllowed !== 'false',
        };
      }
      return false;
    },
  },
  {
    /**
     * Parses dates in the new (variable) format
     */
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (isVariable(node) && parseVariableType(node) === 'date') {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const onlyDate = !![...node.children].find((el) =>
          hasRDFaAttribute(el, 'datatype', XSD('date')),
        );
        const dateNode = [...node.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('content')),
        ) as HTMLElement | undefined;
        const value = dateNode?.getAttribute('content');
        const format = dateNode?.dataset.format;
        const label = parseLabel(node);
        return {
          mappingResource,
          onlyDate,
          value: value,
          format: format,
          custom: dateNode?.dataset.custom === 'true',
          customAllowed: dateNode?.dataset.customAllowed !== 'false',
          label,
        };
      }

      return false;
    },
  },
];

const serialize = (node: PNode, state: EditorState) => {
  const t = getTranslationFunction(state);

  const {
    value,
    onlyDate,
    format,
    mappingResource,
    custom,
    customAllowed,
    label,
  } = node.attrs;
  const datatype = onlyDate ? XSD('date') : XSD('dateTime');
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
    datatype: datatype.prefixed,
    'data-format': format as string,
    'data-custom': custom ? 'true' : 'false',
    'data-custom-allowed': customAllowed ? 'true' : 'false',
    ...(!!value && { content: value as string }),
  };
  return mappingSpan(
    mappingResource,
    { class: 'date', 'data-label': label as string },
    typeSpan('date'),
    contentSpan(dateAttrs, humanReadableDate),
  );
};

const emberNodeConfig = (options: DateOptions): EmberNodeConfig => ({
  name: 'date',
  group: 'inline variable',
  component: DateNodeviewComponent as unknown as ComponentLike,
  inline: true,
  selectable: true,
  draggable: false,
  atom: true,
  defining: false,
  options,
  attrs: {
    mappingResource: {},
    value: {
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
    label: { default: null },
  },
  // TODO: is this property still required?
  leafText: (node: PNode) => {
    const { value, onlyDate, format } = node.attrs;

    const humanReadableDate = value
      ? formatDate(new Date(value), format)
      : onlyDate
      ? TRANSLATION_FALLBACKS.insertDate
      : TRANSLATION_FALLBACKS.insertDateTime;

    return humanReadableDate;
  },
  outlineText: (node: PNode, state: EditorState) => {
    const t = getTranslationFunction(state);
    const { value, onlyDate, format } = node.attrs;

    const humanReadableDate = value
      ? formatDate(new Date(value), format)
      : onlyDate
      ? t('date-plugin.insert.date', TRANSLATION_FALLBACKS.insertDate)
      : t('date-plugin.insert.datetime', TRANSLATION_FALLBACKS.insertDateTime);

    return humanReadableDate;
  },
  serialize,
  parseDOM,
});

export const date = (options: DateOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));
export const dateView = (options: DateOptions) =>
  createEmberNodeView(emberNodeConfig(options));
