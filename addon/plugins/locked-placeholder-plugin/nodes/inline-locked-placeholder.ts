import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import InlineLockedPlaceholderNodeView from '@lblod/ember-rdfa-editor-lblod-plugins/components/locked-placeholder-plugin/nodeviews/inline';
import type { ComponentLike } from '@glint/template';

const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        node.dataset.lockedPlaceholder &&
        node.dataset.lockedPlaceholderType === 'inline'
      ) {
        const label = node.dataset.label;
        const key = node.dataset.key;
        return {
          label,
          key,
        };
      }
      return false;
    },
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  return [
    'span',
    {
      'data-locked-placeholder': 'true',
      'data-locked-placeholder-type': 'inline',
      'data-label': node.attrs['label'],
      'data-key': node.attrs['key'],
    },
    0,
  ];
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'inline-locked-placeholder',
  component: InlineLockedPlaceholderNodeView as unknown as ComponentLike,
  inline: true,
  group: 'inline',
  content: 'inline*',
  atom: true,
  draggable: false,
  needsFFKludge: true,
  editable: true,
  selectable: true,
  attrs: {
    label: {
      default: '',
    },
    key: {
      default: undefined,
    },
  },
  classNames: ['say-inline-locked-placeholder'],
  toDOM,
  parseDOM: parseDOM,
};

export const inlineLockedPlaceholder = createEmberNodeSpec(emberNodeConfig);
export const inlineLockedPlaceholderView = createEmberNodeView(emberNodeConfig);
