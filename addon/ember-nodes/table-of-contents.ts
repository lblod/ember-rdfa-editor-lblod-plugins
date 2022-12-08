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
  group: 'block',
  atom: true,
  attrs: {
    config: {
      default: TABLE_OF_CONTENTS_DEFAULT_CONFIG,
      serialize: (node) => {
        return JSON.stringify(node.attrs['config']);
      },
      parse: (element) => {
        return optionMapOr(
          TABLE_OF_CONTENTS_DEFAULT_CONFIG,
          JSON.parse,
          element.getAttribute('config')
        ) as TableOfContentsConfig;
      },
    },
  },
};

export const tableOfContents = createEmberNodeSpec(emberNodeConfig);
export const tableOfContentsView = createEmberNodeView(emberNodeConfig);
