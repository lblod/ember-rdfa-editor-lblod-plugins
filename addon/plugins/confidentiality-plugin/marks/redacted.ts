import { MarkSpec } from 'prosemirror-model';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export const redacted: MarkSpec = {
  toDOM(_node) {
    return ['span', { property: EXT('redacted').prefixed }, 0];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(value) {
        if (typeof value === 'string') {
          return false;
        }
        return (
          hasRDFaAttribute(value, 'property', EXT('redacted')) && {
            property: value.getAttribute('property'),
          }
        );
      },
    },
  ],
};
