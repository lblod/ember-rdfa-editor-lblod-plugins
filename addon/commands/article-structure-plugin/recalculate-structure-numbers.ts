import { ProseController } from '@lblod/ember-rdfa-editor';
import defaults from '@lblod/ember-rdfa-editor-lblod-plugins/utils/article-structure-plugin/defaults';
import { Command } from 'prosemirror-state';
import {
  ProseStore,
  ResolvedPNode,
} from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';
import { expect, unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { Structure } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/article-structure-plugin/constants';

export default function recalculateStructureNumbers(
  controller: ProseController,
  containerRange: { from: number; to: number } | undefined | null,
  structureType: Structure,
  options: {
    structureTypes: string[];
  }
): Command {
  return (state, dispatch) => {
    if (dispatch) {
      let datastore: ProseStore;
      if (structureType.numbering !== 'continuous' && containerRange) {
        datastore = controller.datastore.limitToRange(
          controller.state,
          containerRange.from,
          containerRange.to
        );
      } else {
        datastore = controller.datastore;
      }
      const structures = datastore
        .match(null, 'a', `>${structureType.type}`)
        .transformDataset((dataset) => {
          return dataset.filter((quad) => {
            return options.structureTypes.includes(quad.object.value);
          });
        })
        .asPredicateNodeMapping()
        .single();
      if (!structures) return true;
      const structuresArray = [...structures.nodes];
      for (let i = 0; i < structuresArray.length; i++) {
        const structure = unwrap(structuresArray[i]);
        replaceNumberIfNeeded(controller, structure, i, structureType);
      }
    }
    return true;
  };
}

function replaceNumberIfNeeded(
  controller: ProseController,
  structure: ResolvedPNode,
  index: number,
  structureType: Structure
) {
  const numberPredicate =
    structureType.numberPredicate || defaults.numberPredicate;
  const resource = structure.node.attrs['resource'] as string;
  let structureNumberObjectNode = controller.datastore
    .match(`>${resource}`, `>${numberPredicate}`)
    .asObjectNodeMapping()
    .single();
  structureNumberObjectNode = expect(
    `${resource} expected to have the predicate ${numberPredicate}`,
    structureNumberObjectNode
  );
  const structureNumber = structureNumberObjectNode.term.value;
  const structureNumberElement = [...structureNumberObjectNode.nodes][0];
  if (!structureNumberElement?.pos) {
    throw new Error('Could not find object node');
  }
  let structureNumberExpected: string;
  if (structureType.numberingFunction) {
    structureNumberExpected = structureType.numberingFunction(index + 1);
  } else {
    structureNumberExpected = (index + 1).toString();
  }
  if (structureNumber !== structureNumberExpected) {
    const { pos, node } = structureNumberElement;
    const from = pos + 1;
    const to = pos + node.nodeSize - 1;
    controller.withTransaction((tr) => {
      return tr.insertText(String(structureNumberExpected), from, to);
    });
  }
}
