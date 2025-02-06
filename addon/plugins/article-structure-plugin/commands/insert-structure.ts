import { Command } from '@lblod/ember-rdfa-editor';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import {
  type StructurePluginOptions,
  type StructureType,
} from '../../structure-plugin/structure-types';
import { recalculateNumbers } from '../../structure-plugin/recalculate-structure-numbers';
import { findHowToInsertStructure } from '../../structure-plugin/insert-structure';
import { regenerateRdfaLinks } from '../../structure-plugin/regenerate-rdfa-links';

const insertStructure = (
  structureType: StructureType,
  uriGenerator: StructurePluginOptions['uriGenerator'],
): Command => {
  return (state, dispatch) => {
    const insertStructureTransaction = findHowToInsertStructure(
      state,
      structureType,
      uriGenerator,
    );
    if (insertStructureTransaction) {
      const { result, transaction } = transactionCombinator(
        state,
        insertStructureTransaction,
        // Prevent calculations that will not fail, if the command is just being tested
      )(dispatch ? [recalculateNumbers, regenerateRdfaLinks] : []);

      transaction.scrollIntoView();
      if (result.every((ok) => ok)) {
        if (dispatch) {
          dispatch(transaction);
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
};

export default insertStructure;
