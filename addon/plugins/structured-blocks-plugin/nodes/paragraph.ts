import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  return {
    name: 'structure-paragraph',
    componentPath: 'structured-blocks-plugin/ember-nodes/paragraph',
    inline: false,
    group: 'block structure structure_paragraph',
    atom: false,
    content: 'inline*',
    toDOM: (_node) => ['p', 0],
    parseDOM: [{ tag: 'p' }],
  };
};

export const paragraph = createEmberNodeSpec(emberNodeConfig());
export const paragraphView = createEmberNodeView(emberNodeConfig());
