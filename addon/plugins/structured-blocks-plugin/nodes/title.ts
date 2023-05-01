import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  return {
    name: 'structure-title',
    componentPath: 'structured-blocks-plugin/ember-nodes/title',
    inline: false,
    group: 'structure_title',
    atom: false,
    content: 'structure_paragraph* structure_chapter*',
    attrs: {
      text: { default: '' },
      childNode: { default: 'structure_chapter' },
    },
    toDOM: (node) => [
      'div',
      {
        property: 'structure-title',
      },
      ['h1', node.attrs.text],
      ['div', 0],
    ],
    parseDOM: [
      {
        tag: 'div h1',
        getAttrs(element: HTMLElement) {
          if (
            element.parentElement?.getAttribute('property') ===
            'structure-title'
          ) {
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
