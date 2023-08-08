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
import { emberApplicationPluginKey } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import IntlService from 'ember-intl/services/intl';

export const emberNodeConfig: (
  config: TableOfContentsConfig,
) => EmberNodeConfig = (config) => {
  return {
    name: 'table-of-contents',
    componentPath: 'table-of-contents-plugin/ember-nodes/table-of-contents',
    inline: false,
    group: 'table_of_contents',
    atom: true,
    attrs: {
      config: {
        default: config,
      },
    },
    serialize(node, state) {
      const intl = emberApplicationPluginKey
        .getState(state)
        ?.application.lookup('service:intl') as IntlService | undefined;
      const lang = state.doc.attrs.lang as string;
      const { config } = node.attrs;
      const entries = extractOutline({
        node: state.doc,
        pos: -1,
        config: config as TableOfContentsConfig,
      });

      const title = intl
        ? intl.t('table-of-contents-plugin.title', {
            locale: lang,
          })
        : 'Inhoudstafel';

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
