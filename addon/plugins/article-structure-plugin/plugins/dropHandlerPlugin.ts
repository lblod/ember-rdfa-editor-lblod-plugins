import { ReplaceStep, Slice } from '@lblod/ember-rdfa-editor';
import { Plugin } from 'prosemirror-state';
import { StructureSpec } from '..';
import { recalculateStructureNumbers } from '../commands';
import { STRUCTURE_SPECS } from '../structures';
import { getContinuousStructureSpecs } from '../utils/structure';

const dropHandlerPlugin = (
  structureSpecs: StructureSpec[] = STRUCTURE_SPECS
) => {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      const dropTransactions = transactions.filter(
        (transaction) => transaction.getMeta('uiEvent') === 'drop'
      );
      if (!dropTransactions.length) return;
      const slices: Slice[] = [];
      for (const transaction of dropTransactions) {
        transaction.steps.forEach((step) => {
          if (step instanceof ReplaceStep) {
            slices.push(step.slice);
          }
        });
      }
      const detectedStructureSpecs: StructureSpec[] = [];
      for (const slice of slices) {
        slice.content.forEach((node) => {
          const structureSpecOfNode = structureSpecs.find(
            (spec) => spec.name === node.type.name
          );
          if (structureSpecOfNode) {
            detectedStructureSpecs.push(structureSpecOfNode);
          }
        });
      }
      if (detectedStructureSpecs.length) {
        const tr = newState.tr;
        recalculateStructureNumbers(
          tr,
          ...getContinuousStructureSpecs(structureSpecs),
          ...detectedStructureSpecs
        );
        return tr;
      }
      return;
      //oldState.
    },
  });
};

export default dropHandlerPlugin;
