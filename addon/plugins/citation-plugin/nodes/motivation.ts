import {
  getRdfaAttrs,
  NodeSpec,
  PNode,
  rdfaAttrs,
} from '@lblod/ember-rdfa-editor';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export const motivation: NodeSpec = {
  content: 'block*',
  group: 'block',
  attrs: {
    ...rdfaAttrs,
  },

  parseDOM: [
    {
      tag: 'div',
      getAttrs(node: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(node);
        if (
          rdfaAttrs &&
          hasRDFaAttribute(node, 'property', BESLUIT('motivering'))
        ) {
          return rdfaAttrs;
        }
        return false;
      },
    },
  ],
  toDOM(node: PNode) {
    return ['div', node.attrs, 0];
  },
};
