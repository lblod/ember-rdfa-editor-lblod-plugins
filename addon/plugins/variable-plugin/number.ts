import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  attributesToDOM,
  emberNodeConfig as baseVariableConfig,
  CONTENT_SELECTOR,
  parseAttributes,
} from './nodes';
import { PNode } from '@lblod/ember-rdfa-editor';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

const emberNodeConfig = (): EmberNodeConfig => {
  const { attrs, ...baseConfig } = baseVariableConfig;
  return {
    ...baseConfig,
    attrs: { ...attrs, value: { default: null } },
    componentPath: 'variable-number/number',
    leafText: (node: PNode) => {
      const { value } = node.attrs;
      return value as string;
    },
    parseDOM: [
      {
        tag: 'span',
        getAttrs: (node: HTMLElement) => {
          const attrs = parseAttributes(node);
          if (attrs && attrs.type === 'number') {
            const content = [...node.children]
              .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
              ?.getAttribute('content');
            return { ...attrs, value: content };
          } else {
            return false;
          }
        },
        contentElement: CONTENT_SELECTOR,
      },
    ],
    toDOM: (node) => {
      return attributesToDOM(node, node.attrs.value);
    },
  };
};

export const number = createEmberNodeSpec(emberNodeConfig());
export const numberView = createEmberNodeView(emberNodeConfig());
