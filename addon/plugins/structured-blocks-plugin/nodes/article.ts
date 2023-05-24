import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { createStructureConfig } from './config';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  const config = createStructureConfig('article');
  return {
    ...config,
    inline: false,
    atom: false,
    content: 'structure_content',
    toDOM: (node: PNode): DOMOutputSpec => [
      'div',
      {
        'data-structure': config.name,
        'data-structure-title': (node.attrs.text as string) ?? '',
        'data-structure-number': (node.attrs.number as number) ?? 1,
      },
      [
        'h5',
        `artikel ${unwrap<string>(node.attrs.number).toString() ?? 1}: ${
          node.attrs.text as string
        }`,
      ],
      ['div', 0],
    ],
    parseDOM: [
      {
        tag: 'div',

        contentElement(element: HTMLElement): HTMLElement {
          return unwrap(element.lastElementChild) as HTMLElement;
        },
        getAttrs(element: HTMLElement) {
          if (element.dataset.structure === config.name) {
            return {
              text: element.dataset.structureTitle ?? '',
              number: element.dataset.structureNumber ?? 1,
            };
          }
          return false;
        },
      },
    ],
    continuous: true,
  };
};

export const article = createEmberNodeSpec(emberNodeConfig());
export const articleView = createEmberNodeView(emberNodeConfig());
