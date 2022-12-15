import { getRdfaAttrs, MarkSpec, rdfaAttrs } from '@lblod/ember-rdfa-editor';

export const citation: MarkSpec = {
  attrs: { test: { default: 'yeet' }, ...rdfaAttrs },
  inclusive: false,
  group: 'linkmarks',
  excludes: 'linkmarks',
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs(dom) {
        if (typeof dom === 'string') {
          return false;
        }
        const type = dom.attributes.getNamedItem('typeof')?.value;
        const property = dom.attributes.getNamedItem('property')?.value;
        if (type === 'eli:LegalExpression' && property === 'eli:cites') {
          return getRdfaAttrs(dom);
        }
        return false;
      },
    },
  ],
  toDOM(node) {
    return ['a', { ...node.attrs, class: 'annotation' }, 0];
  },
};
