import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DOMOutputSpec,
  getRdfaAttrs,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import BlockLockedPlaceholderNodeView from '@lblod/ember-rdfa-editor-lblod-plugins/components/locked-placeholder-plugin/nodeviews/block';
import type { ComponentLike } from '@glint/template';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

const rdfaAware = true;

const CONTENT_SELECTOR = '[data-content-container="true"]';

const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      if (
        node.dataset.lockedPlaceholder &&
        node.dataset.lockedPlaceholderType === 'block'
      ) {
        const filled = node.dataset.filled;
        const key = node.dataset.key;
        return {
          ...attrs,
          filled,
          key,
        };
      }
      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const onlyContentType =
    node.content.size === 1 && node.content.firstChild?.type;
  const className =
    onlyContentType &&
    onlyContentType === onlyContentType.schema.nodes['placeholder']
      ? ' say-variable'
      : '';
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {
      class: `${getClassnamesFromNode(node)}${className}`,
      'data-locked-placeholder': 'true',
      'data-locked-placeholder-type': 'block',
      'data-filled': node.attrs['filled'],
      'data-key': node.attrs['key'],
    },
    content: 0,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'block-locked-placeholder',
  component: BlockLockedPlaceholderNodeView as unknown as ComponentLike,
  inline: false,
  group: 'block',
  content: 'inline*',
  atom: true,
  //recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  editable: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    filled: {
      default: false,
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
