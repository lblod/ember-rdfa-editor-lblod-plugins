import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { TableOfContentsConfig } from '..';
import { createTableOfContents } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/utils';
import IntlService from 'ember-intl/services/intl';

export const emberNodeConfig: (
  config: TableOfContentsConfig,
  intl: IntlService
) => EmberNodeConfig = (config, intl) => {
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
      entries: {
        default: null,
      },
    },
    toDOM(node) {
      const { entries } = node.attrs;

      if (!entries) {
        return [
          'div',
          {
            'data-ember-node': 'table-of-contents',
            class: 'table-of-contents',
          },
          ['h3', {}, intl.t('table-of-contents-plugin.title')],
        ];
      }

      return [
        'div',
        { 'data-ember-node': 'table-of-contents', class: 'table-of-contents' },
        ['h3', {}, intl.t('table-of-contents-plugin.title')],
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

export const table_of_contents = (
  config: TableOfContentsConfig,
  intl: IntlService
) => createEmberNodeSpec(emberNodeConfig(config, intl));
export const tableOfContentsView = (
  config: TableOfContentsConfig,
  intl: IntlService
) => createEmberNodeView(emberNodeConfig(config, intl));
