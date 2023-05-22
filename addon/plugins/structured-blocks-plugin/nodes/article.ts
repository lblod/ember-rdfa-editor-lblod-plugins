import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { createStructureConfig } from './config';
import { NodeView } from '@lblod/ember-rdfa-editor/addon';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  const config = createStructureConfig('article');
  return {
    ...config,
    inline: false,
    atom: false,
    content: 'structure_content',
    ignoreMutation(view: NodeView) {
      return function (mutation: MutationRecord) {
        if (!view.contentDOM) {
          console.log(
            'ignored mutation cause there is no contentDOM',
            mutation
          );
          return true;
        }
        if (
          view.contentDOM.contains(mutation.target) ||
          (mutation.addedNodes.item(0) as Element)?.classList.contains(
            'content-area'
          ) ||
          (mutation.removedNodes.item(0) as Element)?.classList.contains(
            'content-area'
          )
        ) {
          console.log('accepted mutation', mutation);
          return false;
        } else {
          console.log('accepted mutation', mutation);
          return false;
        }
      };
    },
    toDOM: (_node) => ['h6', 0],
    parseDOM: [{ tag: 'h6' }],
    continuous: true,
  };
};

export const article = createEmberNodeSpec(emberNodeConfig());
export const articleView = createEmberNodeView(emberNodeConfig());
