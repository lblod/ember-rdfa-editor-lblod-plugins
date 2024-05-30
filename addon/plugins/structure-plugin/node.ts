import type { ComponentLike } from '@glint/template';
import { PNode } from '@lblod/ember-rdfa-editor';
import Structure from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/_private/structure';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  return {
    name: 'structure',
    component: Structure as unknown as ComponentLike,
    inline: false,
    group: 'block',
    content: 'block+',
    draggable: true,
    selectable: true,
    isolating: true,
    atom: false,
    attrs: {
      title: {
        default: 'title',
      },
      __title: {
        default: 'title',
      }
    },
    serialize(node: PNode) {
      const parser = new DOMParser();
      const html = parser.parseFromString(node.attrs.__title, 'text/html');

      return [
        'div',
        {
          typeof: EXT('Structure').prefixed,
        },
        ['h3', {}, html.body.firstElementChild],
        ['div', { property: EXT('content').prefixed }, 0],
      ];
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(element: HTMLElement) {
          if (hasRDFaAttribute(element, 'typeof', EXT('Structure'))) {
            const titleElement = element.firstElementChild;
            if (!titleElement) return false;
            return { title: titleElement.innerHTML, __title: titleElement.innerHTML };
          }
          return false;
        },
        contentElement: `div[property~='${EXT('content').prefixed}'],
        div[property~='${EXT('content').full}']`,
      },
    ],
  };
};

export const structure = createEmberNodeSpec(emberNodeConfig());
export const structureView = createEmberNodeView(emberNodeConfig());
