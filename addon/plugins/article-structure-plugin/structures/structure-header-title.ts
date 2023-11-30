import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export const structure_header_title: NodeSpec = {
  attrs: {
    ...rdfaAttrSpec,
  },
  content: 'text*',
  inline: true,
  editable: true,
  hasRdfa: true,
  toDOM(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'span',
      attrs: node.attrs,
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node);
        if (
          attrs &&
          attrs.backlinks.some((bl) => bl.predicate === EXT('title').prefixed)
        ) {
          return attrs;
        }
        return false;
      },
      contentElement: '[data-content-container~="true"]',
    },
  ],
};
