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
          'data-say-mandatee-table': true,
          'data-say-mandatee-table-tag': tag,
          'data-say-mandatee-table-title': title,
          class: 'say-mandatee-table-node',
        },
        ['p', { class: 'say-mandatee-table-header' }, ['strong', {}, title]],
        [
          'div',
          {
            class: 'say-mandatee-table-content',
            'data-say-mandatee-table-content': true,
          },
          0,
        ],
      ];
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(element: HTMLElement) {
          if (
            element.dataset.sayMandateeTable &&
            element.dataset.sayMandateeTableTag
          ) {
            return {
              tag: element.dataset.sayMandateeTableTag,
              title: element.dataset.sayMandateeTableTitle,
            };
          }
          return false;
        },
        contentElement: `div[data-say-mandatee-table-content]`,
      },
    ],
  };
};

export const mandatee_table = createEmberNodeSpec(emberNodeConfig());
export const mandateeTableView = createEmberNodeView(emberNodeConfig());
