import { NodeSpec } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { formatDate, validateDateFormat } from '../utils';

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
        default: new Date().toISOString(),
      },
      format: {
        default: 'dd/MM/yyyy',
      },
      onlyDate: {
        default: true,
      },
      custom: {
        default: false,
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
      const { value, onlyDate, format, mappingResource, custom } = node.attrs;
      const datatype = onlyDate ? XSD('date') : XSD('dateTime');
      let humanReadableDate: string;
      if (value) {
        if (validateDateFormat(format).type === 'ok') {
          humanReadableDate = formatDate(new Date(value), format);
        } else {
          humanReadableDate = 'Ongeldig formaat';
        }
      } else {
        humanReadableDate = onlyDate
          ? options.placeholder.insertDate
          : options.placeholder.insertDateTime;
      }
      const dateAttrs = {
        datatype: datatype.prefixed,
        property: EXT('content').prefixed,
        'data-format': format as string,
        'data-custom': custom ? 'true' : 'false',
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
          if (hasRDFaAttribute(node, 'typeof', EXT('Mapping'))) {
            const mappingResource = node.getAttribute('resource');
            if (!mappingResource) {
              return false;
            }
            const variableType = [...node.children]
              .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
              ?.getAttribute('content');
            const datatype = [...node.children]
              .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
              ?.getAttribute('datatype');
            if (variableType === 'date' && datatype) {
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
                format: dateNode?.getAttribute('data-format'),
                custom: dateNode?.getAttribute('data-custom') === 'true',
              };
            }
          }
          return false;
        },
      },
    ],
  };
};

export default date;
