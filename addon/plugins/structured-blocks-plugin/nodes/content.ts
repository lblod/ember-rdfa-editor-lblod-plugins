import { NodeSpec, PNode } from '@lblod/ember-rdfa-editor';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { createStructureConfig } from './config';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  const config = createStructureConfig('content');
  return {
    ...config,
    inline: false,
    atom: true,
    content: 'block+',
    selectable: true,
    ignoreMutation(mutation: MutationRecord) {
      return false;
    },
    stopEvent: (event: Event) => {
      return true;
    },
    draggable: false,
    toDOM: (_node) => ['p', 0],
    parseDOM: [{ tag: 'p' }],
  };
};

export const content: NodeSpec = {
  inline: false,
  group: 'content structure',
  content: 'block+',
  draggable: false,
  isolating: true,
  defining: true,
  selectable: false,
  toDOM(node: PNode) {
    return [
      'p',
      {
        'data-is-content': 'true',
        class: 'au-u-11-12 border au-c-textarea content-area',
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'p',
      getAttrs(element: HTMLElement) {
        if (element.dataset['data-is-content'] === 'true') {
          return {};
        }
        return false;
      },
    },
  ],
};

export const contentView = createEmberNodeView(emberNodeConfig());
