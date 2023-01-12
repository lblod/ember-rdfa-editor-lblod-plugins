import { NodeSpec } from '@lblod/ember-rdfa-editor';
import {
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
        ? formatDate(new Date(value), onlyDate, format)
        : onlyDate
        ? options.placeholder.insertDate
        : options.placeholder.insertDateTime;
      const attrs = {
        class: 'date',
        datatype: datatype.prefixed,
        property: EXT('content').prefixed,
        ...(!!value && { content: value as string }),
      };
      return ['span', attrs, humanReadableDate];
    },
    parseDOM: [
      {
        tag: 'span',
        getAttrs: (node: HTMLElement) => {
          if (hasRDFaAttribute(node, 'datatype', XSD('date'))) {
            // const contentAttr = node.getAttribute('content');
            // const parsedDate = contentAttr ? new Date(contentAttr) : null;
            return {
              value: node.getAttribute('content'),
              onlyDate: true,
            };
          }
          return false;
        },
      },
      {
        tag: 'span',
        getAttrs: (node: HTMLElement) => {
          if (hasRDFaAttribute(node, 'datatype', XSD('dateTime'))) {
            // const contentAttr = node.getAttribute('content');
            // const parsedDate = contentAttr ? new Date(contentAttr) : null;
            return {
              value: node.getAttribute('content'),
              onlyDate: false,
            };
          }
          return false;
        },
      },
    ],
  };
};

function formatDate(date: Date, onlyDate: boolean, format: string) {
  return formatWithOptions({ locale: nlBE }, format)(date);
}

export default date;
