import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  return {
    name: 'structure-chapter',
    componentPath: 'structured-blocks-plugin/ember-nodes/chapter',
    inline: false,
    group: 'structure_chapter',
    atom: false,
    content: 'structure_paragraph*',
    attrs: {
      text: { default: '' },
    },
    toDOM: (node) => [
      'div',
      {
        property: 'structure-chapter',
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
            'structure-chapter'
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

export const chapter = createEmberNodeSpec(emberNodeConfig());
export const chapterView = createEmberNodeView(emberNodeConfig());
