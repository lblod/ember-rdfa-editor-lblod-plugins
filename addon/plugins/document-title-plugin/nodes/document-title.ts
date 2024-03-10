import {
  NodeSpec,
  getRdfaAttrs,
  rdfaAttrSpec,
  rdfaAttrs,
} from '@lblod/ember-rdfa-editor';

import { ELI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

const rdfaAware = true;
export const document_title: NodeSpec = {
  content: 'paragraph{1}',
  inline: false,
  defining: true,
  canSplit: false,
  group: '',
  allowSplitByTable: false,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    property: {
      default: 'eli:title',
    },
    datatype: {
      default: 'xsd:string',
    },
  },
  toDOM(node) {
    return ['h4', node.attrs, 0];
  },
  parseDOM: [
    {
      tag: 'h1,h2,h3,h4,h5',
      getAttrs(element: HTMLElement) {
        if (hasRDFaAttribute(element, 'property', ELI('title'))) {
          return getRdfaAttrs(element, { rdfaAware });
        }
        return false;
      },
    },
  ],
};
