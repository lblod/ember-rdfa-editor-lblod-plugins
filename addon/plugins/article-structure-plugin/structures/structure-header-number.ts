import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { ELI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasBacklink } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export const structure_header_number: NodeSpec = {
  attrs: rdfaAttrSpec,
  content: 'text*',
  inline: true,
  editable: true,
  hasRdfa: true,
  toDOM(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'span',
      attrs: {
        contenteditable: false,
        ...node.attrs,
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node);
        if (hasBacklink(attrs, ELI('number'))) {
          return attrs;
        }
        return false;
      },
      contentElement: '[data-content-container~="true"]',
    },
  ],
};
