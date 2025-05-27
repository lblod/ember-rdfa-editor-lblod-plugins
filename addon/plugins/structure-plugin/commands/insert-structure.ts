import { Command } from '@lblod/ember-rdfa-editor';
import {
  type StructurePluginOptions,
  type StructureType,
} from '../../structure-plugin/structure-types';
import { findHowToInsertStructure } from '../monads/insert-structure';
import { closeHistory } from '@lblod/ember-rdfa-editor/plugins/history';

export const insertStructure = (
  structureType: StructureType,
  uriGenerator: Required<StructurePluginOptions>['uriGenerator'],
): Command => {
  return (state, dispatch) => {
    const { result, transaction } = findHowToInsertStructure(
      structureType,
      uriGenerator,
    )(state, { sayIsDryRun: !dispatch });

    transaction.scrollIntoView();
    if (result) {
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
