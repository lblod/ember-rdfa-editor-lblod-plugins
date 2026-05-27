import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import BlockLockedPlaceholderNodeView from '@lblod/ember-rdfa-editor-lblod-plugins/components/locked-placeholder-plugin/nodeviews/block';
import type { ComponentLike } from '@glint/template';

const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        node.dataset.lockedPlaceholder &&
        node.dataset.lockedPlaceholderType === 'block'
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
      'data-locked-placeholder-type': 'block',
      'data-label': node.attrs['label'],
      'data-key': node.attrs['key'],
    },
    0,
  ];
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'block-locked-placeholder',
  component: BlockLockedPlaceholderNodeView as unknown as ComponentLike,
  inline: false,
  group: 'block',
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
  classNames: ['say-block-locked-placeholder'],
  toDOM,
  parseDOM: parseDOM,
};

export const blockLockedPlaceholder = createEmberNodeSpec(emberNodeConfig);
export const blockLockedPlaceholderView = createEmberNodeView(emberNodeConfig);
