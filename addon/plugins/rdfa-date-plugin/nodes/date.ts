import { NodeSpec } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { formatWithOptions } from 'date-fns/fp';
import { nlBE } from 'date-fns/locale';

export type DateOptions = {
  placeholder: {
    insertDate: string;
    insertDateTime: string;
  };
};
const date: (options: DateOptions) => NodeSpec = (options) => {
  return {
    group: 'inline',
    inline: true,
    attrs: {
      mappingResource: {
        default: null,
      },
      value: {
        default: null,
      },
      format: {
        default: 'dd/mm/yyyy',
      },
      onlyDate: {
        default: true,
      },
    },
    selectable: true,
    leafText: (node) => {
      const { value, onlyDate, format } = node.attrs;
      const humanReadableDate = value
        ? formatDate(new Date(value), format)
        : onlyDate
        ? options.placeholder.insertDate
        : options.placeholder.insertDateTime;
      return humanReadableDate;
    },
    toDOM: (node) => {
      const { value, onlyDate, format, mappingResource } = node.attrs;
      const datatype = onlyDate ? XSD('date') : XSD('dateTime');
      const humanReadableDate = value
        ? formatDate(new Date(value), format)
        : onlyDate
        ? options.placeholder.insertDate
        : options.placeholder.insertDateTime;
      const dateAttrs = {
        datatype: datatype.prefixed,
        property: EXT('content').prefixed,
        ...(!!value && { content: value as string }),
      };
      if (mappingResource) {
        return [
          'span',
          {
            resource: mappingResource as string,
            typeof: EXT('Mapping').prefixed,
            class: 'date',
          },
          ['span', { property: DCT('type').prefixed, content: 'date' }],
          ['span', dateAttrs, humanReadableDate],
        ];
      } else {
        return ['span', { class: 'date', ...dateAttrs }, humanReadableDate];
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
              value: node.getAttribute('content'),
              onlyDate,
            };
          }
          return false;
        },
      },
      {
        tag: 'span',
        getAttrs: (node: HTMLElement) => {
          if (hasRDFaAttribute(node, 'typeof', EXT('Mapping'))) {
            const variableType = [...node.children]
              .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
              ?.getAttribute('content');
            const datatype = [...node.children]
              .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
              ?.getAttribute('datatype');
            if (variableType === 'date' && datatype) {
              const mappingResource = node.getAttribute('resource');
              const onlyDate = !![...node.children].find((el) =>
                hasRDFaAttribute(el, 'datatype', XSD('date'))
              );
              const dateNode = [...node.children].find((el) =>
                hasRDFaAttribute(el, 'property', EXT('content'))
              );
              return {
                mappingResource,
                onlyDate,
                value: dateNode?.getAttribute('content'),
              };
            }
          }
          return false;
        },
      },
    ],
  };
};

function formatDate(date: Date, format: string) {
  return formatWithOptions({ locale: nlBE }, format)(date);
}

export default date;
