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
import { DateOptions } from '..';
import { formatDate, validateDateFormat } from '../utils';
import { EditorState, PNode } from '@lblod/ember-rdfa-editor';
import {
  isVariable,
  parseLabel,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import {
  mappingSpan,
  typeSpan,
} from '../../variable-plugin/utils/dom-constructors';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import DateComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/rdfa-date-plugin/date';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

const insertDate = 'Datum invoegen';
const insertDateTime = 'Datum en tijd invoegen';
const unknownFormat = 'Ongeldig formaat';

const emberNodeConfig = (options: DateOptions): EmberNodeConfig => ({
  name: 'date',
  group: 'inline variable',
  component: DateComponent as unknown as ComponentLike,
  inline: true,
  selectable: true,
  draggable: false,
  atom: true,
  defining: false,
  options,
  attrs: {
    mappingResource: {
      default: null,
    },
    humanReadableDate: {
      default: insertDate,
    },
    value: {},
    format: {
      default: options.formats[0].dateFormat,
    },
    onlyDate: {
      default: true,
    },
    custom: {
      default: false,
    },
    label: { default: null },
  },
  leafText: (node: PNode) => {
    const { value, onlyDate, format } = node.attrs;

    const humanReadableDate = value
      ? formatDate(new Date(value), format)
      : onlyDate
      ? insertDate
      : insertDateTime;

    return humanReadableDate;
  },
  outlineText: (node: PNode, state: EditorState) => {
    const t = getTranslationFunction(state);
    const { value, onlyDate, format } = node.attrs;

    const humanReadableDate = value
      ? formatDate(new Date(value), format)
      : onlyDate
      ? t('date-plugin.insert.date', insertDate)
      : t('date-plugin.insert.datetime', insertDateTime);

    return humanReadableDate;
  },
  serialize: (node, state) => {
    const t = getTranslationFunction(state);

    const { value, onlyDate, format, mappingResource, custom, label } =
      node.attrs;
    const datatype = onlyDate ? XSD('date') : XSD('dateTime');
    let humanReadableDate: string;
    if (value) {
      if (validateDateFormat(format).type === 'ok') {
        humanReadableDate = formatDate(new Date(value), format);
      } else {
        humanReadableDate = t('date-plugin.validation.unknown', unknownFormat);
      }
    } else {
      humanReadableDate = (onlyDate as boolean)
        ? t('date-plugin.insert.date', insertDate)
        : t('date-plugin.insert.datetime', insertDateTime);
    }
    const dateAttrs = {
      datatype: datatype.prefixed,
      property: EXT('content').prefixed,
      'data-format': format as string,
      'data-custom': custom ? 'true' : 'false',
      ...(!!value && { content: value as string }),
    };
    if (mappingResource) {
      return mappingSpan(
        mappingResource,
        { class: 'date', 'data-label': label as string },
        typeSpan('date'),
        span(dateAttrs, humanReadableDate),
      );
    } else {
      return span({ class: 'date', ...dateAttrs }, humanReadableDate);
    }
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs: (node: HTMLElement) => {
        if (
          hasRDFaAttribute(node, 'datatype', XSD('date')) ||
          hasRDFaAttribute(node, 'datatype', XSD('dateTime'))
        ) {
          const onlyDate = hasRDFaAttribute(node, 'datatype', XSD('date'));
          return {
            value: node.getAttribute('content') ?? new Date().toISOString(),
            onlyDate,
            format: node.dataset.format,
            custom: node.dataset.custom === 'true',
          };
        }
        return false;
      },
    },
    {
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
          let humanReadableDate: string;
          const value = dateNode?.getAttribute('content');
          const format = dateNode?.dataset.format;
          if (value && format) {
            if (validateDateFormat(format).type === 'ok') {
              humanReadableDate = formatDate(new Date(value), format);
            } else {
              humanReadableDate = unknownFormat;
            }
          } else {
            humanReadableDate = onlyDate ? insertDate : insertDateTime;
          }
          const label = parseLabel(node);
          return {
            mappingResource,
            onlyDate,
            humanReadableDate,
            value: value,
            format: format,
            custom: dateNode?.dataset.custom === 'true',
            label,
          };
        }

        return false;
      },
    },
  ],
});

export const date = (options: DateOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));
export const dateView = (options: DateOptions) =>
  createEmberNodeView(emberNodeConfig(options));
