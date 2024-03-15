import { Command, PNode } from '@lblod/ember-rdfa-editor';

import type { ArticleStructurePluginOptions } from '..';
import recalculateStructureNumbers from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands/recalculate-structure-numbers';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

const setStructureStartNumber = (
  structure: { pos: number; node: PNode },
  options: ArticleStructurePluginOptions,
  startNumber: number | null,
): Command => {
  return (state, dispatch) => {
    const currentStructureSpec = unwrap(
      options.find((spec) => spec.name === structure.node.type.name),
    );

    if (dispatch) {
      const transaction = state.tr;

      currentStructureSpec.setStartNumber({
        number: startNumber,
        pos: structure.pos,
        transaction,
      });

      recalculateStructureNumbers(transaction, state.schema, ...options);

      dispatch(transaction);
    }
    return true;
  };
};

export default setStructureStartNumber;
