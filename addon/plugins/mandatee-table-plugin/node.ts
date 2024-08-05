import type { ComponentLike } from '@glint/template';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import MandateeTableNode from '@lblod/ember-rdfa-editor-lblod-plugins/components/mandatee-table-plugin/node';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  return {
    name: 'mandatee-table',
    component: MandateeTableNode as unknown as ComponentLike,
    inline: false,
    content: 'block+',
    group: 'block',
    draggable: false,
    selectable: true,
    editable: true,
    atom: false,
    isolating: true,
    attrs: {
      tag: {},
      title: {
        default: 'Mandatarissen',
      },
    },
    serialize(node) {
      const tag = node.attrs.tag as string;
      const title = node.attrs.title as string;
      return [
        'div',
        {
          'data-mandatee-table': true,
          'data-tag': tag,
          'data-title': title,
        },
        0,
      ];
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(element: HTMLElement) {
          if (element.dataset.mandateeTable && element.dataset.tag) {
            return {
              tag: element.dataset.tag,
              title: element.dataset.title,
            };
          }
          return false;
        },
      },
    ],
  };
};

export const mandatee_table = createEmberNodeSpec(emberNodeConfig());
export const mandateeTableView = createEmberNodeView(emberNodeConfig());
