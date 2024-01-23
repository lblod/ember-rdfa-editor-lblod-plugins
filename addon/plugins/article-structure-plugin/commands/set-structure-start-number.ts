import { Command } from '@lblod/ember-rdfa-editor';

import { findAncestorOfType } from '../utils/structure';
import type { ArticleStructurePluginOptions } from '..';
import recalculateStructureNumbers from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands/recalculate-structure-numbers';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

const setStructureStartNumber = (
  options: ArticleStructurePluginOptions,
  startNumber: number | null,
): Command => {
  return (state, dispatch) => {
    const { selection, schema } = state;

    const structureSpecs = options.map((type) => schema.nodes[type.name]);
    const currentStructure = findAncestorOfType(selection, ...structureSpecs);

    if (!currentStructure || currentStructure.pos === -1) {
      return false;
    }

    const currentStructureSpec = unwrap(
      options.find((spec) => spec.name === currentStructure.node.type.name),
    );

    if (dispatch) {
      const transaction = state.tr;

      currentStructureSpec.setStartNumber({
        number: startNumber,
        pos: currentStructure.pos,
        transaction,
      });

      recalculateStructureNumbers(transaction, ...options);

      dispatch(transaction);
    }
    return true;
  };
};

export default setStructureStartNumber;
