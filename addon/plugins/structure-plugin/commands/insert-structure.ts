import { Command } from '@lblod/ember-rdfa-editor';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import {
  type StructurePluginOptions,
  type StructureType,
} from '../../structure-plugin/structure-types';
import { recalculateNumbers } from '../monads/recalculate-structure-numbers';
import { findHowToInsertStructure } from '../monads/insert-structure';
import { regenerateRdfaLinks } from '../monads/regenerate-rdfa-links';
import { closeHistory } from '@lblod/ember-rdfa-editor/plugins/history';

export const insertStructure = (
  structureType: StructureType,
  uriGenerator: Required<StructurePluginOptions>['uriGenerator'],
): Command => {
  return (state, dispatch) => {
    const { result, transaction } = transactionCombinator(state)([
      findHowToInsertStructure(structureType, uriGenerator),
      // Prevent calculations that will not fail, if the command is just being tested
      ...(dispatch ? [recalculateNumbers, regenerateRdfaLinks] : []),
    ]);

    transaction.scrollIntoView();
    if (result.every((ok) => ok)) {
      if (dispatch) {
        // makes sure each structure insertion is undoable, even when quickly
        // creating a bunch of them
        closeHistory(transaction);
        dispatch(transaction);
      }
      return true;
    } else {
      return false;
    }
  };
};
