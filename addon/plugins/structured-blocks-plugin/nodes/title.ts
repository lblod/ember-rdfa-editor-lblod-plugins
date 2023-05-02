import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

import { createStructureConfig } from './config';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  const config = createStructureConfig('title');
  return {
    ...config,
    toDOM: (node) => [
      'div',
      {
        property: config.name,
      },
      ['h1', node.attrs.text],
      ['div', 0],
    ],
    parseDOM: [
      {
        tag: 'div h1',
        getAttrs(element: HTMLElement) {
          if (element.parentElement?.getAttribute('property') === config.name) {
            return { text: element.innerText };
          } else {
            return false;
          }
        },
      },
    ],
  };
};

export const title = createEmberNodeSpec(emberNodeConfig());
export const titleView = createEmberNodeView(emberNodeConfig());
