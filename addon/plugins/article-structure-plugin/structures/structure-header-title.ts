import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import {
  getRdfaContentElement,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasBacklink } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export const structure_header_title: NodeSpec = {
  attrs: rdfaAttrSpec,
  content: 'placeholder|text*',
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
        if (hasBacklink(attrs, EXT('title'))) {
          return attrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
  ],
};
