import { NodeSpec } from '@lblod/ember-rdfa-editor';
import {
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { formatDate } from '../utils';

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
    toDOM: (node) => {
      const { value, onlyDate, format } = node.attrs;
      const datatype = onlyDate ? XSD('date') : XSD('dateTime');
      const humanReadableDate = value
        ? formatDate(new Date(value), format)
        : onlyDate
        ? options.placeholder.insertDate
        : options.placeholder.insertDateTime;
      const attrs = {
        class: 'date',
        datatype: datatype.prefixed,
        property: EXT('content').prefixed,
        'data-format': format as string,
        ...(!!value && { content: value as string }),
      };
      return ['span', attrs, humanReadableDate];
    },
    parseDOM: [
      {
        tag: 'span',
        getAttrs: (node: HTMLElement) => {
          if (hasRDFaAttribute(node, 'datatype', XSD('date'))) {
            return {
              value: node.getAttribute('content'),
              onlyDate: true,
              format: node.dataset.format,
            };
          }
          return false;
        },
      },
      {
        tag: 'span',
        getAttrs: (node: HTMLElement) => {
          if (hasRDFaAttribute(node, 'datatype', XSD('dateTime'))) {
            return {
              value: node.getAttribute('content'),
              onlyDate: false,
              format: node.dataset.format,
            };
          }
          return false;
        },
      },
    ],
  };
};

export default date;
