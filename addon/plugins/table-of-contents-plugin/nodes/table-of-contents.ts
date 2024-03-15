import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { TableOfContentsConfig } from '..';
import {
  createTableOfContents,
  extractOutline,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/utils';
import TableOfContentsComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/table-of-contents-plugin/ember-nodes/table-of-contents';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const emberNodeConfig: (
  config: TableOfContentsConfig,
) => EmberNodeConfig = (config) => {
  return {
    name: 'table-of-contents',
    component: TableOfContentsComponent as unknown as ComponentLike,
    inline: false,
    group: 'table_of_contents',
    atom: true,
    attrs: {
      config: {
        default: config,
      },
    },
    serialize(node, state) {
      const t = getTranslationFunction(state);

      const { config } = node.attrs;
      const entries = extractOutline({
        node: unwrap(state).doc,
        pos: -1,
        config: config as TableOfContentsConfig,
        state: unwrap(state),
      });

      const title = t('table-of-contents-plugin.title', 'Inhoudstafel');
      return [
        'div',
        { 'data-ember-node': 'table-of-contents', class: 'table-of-contents' },
        ['h3', {}, title],
        createTableOfContents(entries),
      ];
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(element: HTMLElement) {
          if (
            element.dataset['emberNode'] === 'table-of-contents' ||
            // Ensure backwards compatibility
            element.dataset['inlineComponent'] ===
              'inline-components/table-of-contents' ||
            (element.classList.contains('inline-component') &&
              element.classList.contains('inline-components/table-of-contents'))
          ) {
            return {};
          }
          return false;
        },
      },
    ],
  };
};

export const table_of_contents = (config: TableOfContentsConfig) =>
  createEmberNodeSpec(emberNodeConfig(config));
export const tableOfContentsView = (config: TableOfContentsConfig) =>
  createEmberNodeView(emberNodeConfig(config));
