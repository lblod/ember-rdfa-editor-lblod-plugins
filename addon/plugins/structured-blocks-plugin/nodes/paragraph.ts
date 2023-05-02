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
    content: 'inline*',
    toDOM: (_node) => ['p', 0],
    parseDOM: [{ tag: 'p' }],
  };
};

export const paragraph = createEmberNodeSpec(emberNodeConfig());
export const paragraphView = createEmberNodeView(emberNodeConfig());
