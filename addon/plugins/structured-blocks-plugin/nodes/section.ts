import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { createStructureConfig } from './config';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  const config = createStructureConfig('section');
  return {
    ...config,
    toDOM: (node) => [
      'div',
      {
        'data-structure': config.name,
        'data-structure-title': (node.attrs.text as string) ?? '',
        'data-structure-number': (node.attrs.number as number) ?? 1,
      },
      [
        'h3',
        `Afdeling ${unwrap<string>(node.attrs.number).toString() ?? 1}.: ${
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
          } else {
            return false;
          }
        },
      },
    ],
  };
};

export const section = createEmberNodeSpec(emberNodeConfig());
export const sectionView = createEmberNodeView(emberNodeConfig());
