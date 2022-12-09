import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/option';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  TableOfContentsConfig,
  TABLE_OF_CONTENTS_DEFAULT_CONFIG,
} from '../constants';

export const emberNodeConfig: EmberNodeConfig = {
  name: 'table-of-contents',
  componentPath: 'table-of-contents-plugin/ember-nodes/table-of-contents',
  inline: false,
  group: 'tableOfContents',
  atom: true,
  attrs: {
    config: {
      default: TABLE_OF_CONTENTS_DEFAULT_CONFIG,
      serialize: (node) => {
        return JSON.stringify(node.attrs['config']);
      },
    },
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(element: HTMLElement) {
        if (
          element.dataset['emberNode'] === 'table-of-contents' ||
          // Ensure backwards compatibility
          element.dataset['inlineComponent'] === 'table-of-contents' ||
          (element.classList.contains('inline-component') &&
            element.classList.contains('table-of-contents'))
        ) {
          return {
            config: optionMapOr(
              TABLE_OF_CONTENTS_DEFAULT_CONFIG,
              JSON.parse,
              element.getAttribute('config')
            ) as TableOfContentsConfig,
          };
        }
        return false;
      },
    },
  ],
};

export const tableOfContents = createEmberNodeSpec(emberNodeConfig);
export const tableOfContentsView = createEmberNodeView(emberNodeConfig);
