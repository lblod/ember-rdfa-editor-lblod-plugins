import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { createStructureConfig } from './config';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  const config = createStructureConfig('paragraph');
  return {
    ...config,
    inline: false,
    atom: false,
    content: 'structure_paragraph*',
    toDOM: (_node) => ['h6', 0],
    parseDOM: [{ tag: 'h6' }],
  };
};

export const article = createEmberNodeSpec(emberNodeConfig());
export const articleView = createEmberNodeView(emberNodeConfig());
